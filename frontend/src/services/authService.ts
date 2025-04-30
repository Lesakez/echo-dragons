// src/services/authService.ts
import axios from 'axios';
import { API_URL } from '../config';
import socketService from './socketService';
import { User, AuthResponse } from '../store/slices/authSlice'; // Импортируем типы напрямую из authSlice

// Определяем тип ответа для обновления токена
interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

class AuthService {
  /**
   * Регистрация нового пользователя
   */
  async register(userData: { username: string; email: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, userData);
      this.setAuthTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error; // TypeScript знает, что этот код недостижим, но он нужен для типизации
    }
  }

  /**
   * Вход пользователя
   */
  async login(userData: { emailOrUsername: string; password: string }): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, userData);
      this.setAuthTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error; // TypeScript знает, что этот код недостижим, но он нужен для типизации
    }
  }

  /**
   * Получение профиля текущего пользователя
   */
  async getProfile(): Promise<User> {
    try {
      // Проверяем наличие токена перед запросом
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен аутентификации не найден');
      }
      
      const response = await axios.get<User>(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      // Если 401, пытаемся обновить токен
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const refreshed = await this.attemptTokenRefresh();
        
        // Если обновление токена прошло успешно, повторяем запрос профиля
        if (refreshed) {
          return this.getProfile();
        }
      }
      
      this.handleApiError(error);
      throw error; // TypeScript знает, что этот код недостижим, но он нужен для типизации
    }
  }

  /**
   * Обновление токена доступа с помощью токена обновления
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    try {
      const response = await axios.post<RefreshResponse>(`${API_URL}/auth/refresh-token`, { refreshToken });
      this.setAuthTokens(response.data.access_token, response.data.refresh_token);
      return response.data;
    } catch (error) {
      // Если обновление не удалось, разлогиниваем пользователя
      this.logout();
      this.handleApiError(error);
      throw error; // TypeScript знает, что этот код недостижим, но он нужен для типизации
    }
  }

  /**
   * Выход пользователя
   */
  logout(): boolean {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    
    // Удаляем заголовок авторизации из axios
    delete axios.defaults.headers.common['Authorization'];
    
    // Обновляем аутентификацию в сокете
    socketService.updateToken();
    
    return true;
  }

  /**
   * Проверка, вошел ли пользователь
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Установка токенов авторизации и настройка сервисов
   */
  private setAuthTokens(accessToken: string, refreshToken: string): void {
    // Сохраняем токены в localStorage
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    
    // Устанавливаем заголовок авторизации для всех будущих запросов axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // Обновляем аутентификацию в сокете
    socketService.updateToken();
  }

  /**
   * Попытка автоматического обновления токена
   */
  private async attemptTokenRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('Токен обновления недоступен');
      }
      
      await this.refreshToken(refreshToken);
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Единообразная обработка ошибок API
   */
  private handleApiError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      // Извлекаем сообщение об ошибке из ответа
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    } else {
      // Для не-Axios ошибок
      throw error as Error;
    }
  }
}

export default new AuthService();