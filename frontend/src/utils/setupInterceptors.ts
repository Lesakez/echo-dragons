// src/utils/setupInterceptors.ts
import axios from 'axios';
import { getToken } from './auth';
import { store } from '../store';
import { refreshToken, logout } from '../store/slices/authSlice';

// Добавляем перехватчик запросов для обеспечения установки токена
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Добавляем перехватчик ответов для обработки ошибок 401
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Повторяем запрос только один раз, чтобы избежать зацикливания
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Пытаемся обновить токен через действие Redux
        await store.dispatch(refreshToken());
        
        // Если дошли до этой точки, значит токен обновлен успешно
        const token = getToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (error) {
        // Если обновление токена не удалось, выходим из системы
        store.dispatch(logout());
        return Promise.reject(new Error('Аутентификация не удалась. Пожалуйста, войдите снова.'));
      }
    }
    
    return Promise.reject(error);
  }
);