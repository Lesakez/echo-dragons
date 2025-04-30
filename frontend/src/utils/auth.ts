// src/utils/auth.ts
import axios from 'axios';
import { Store, Action, Dispatch } from '@reduxjs/toolkit';
import { RootState } from '../types/redux';

/**
 * Установка токена авторизации в localStorage и настройках axios
 */
export const setAuthToken = (token: string): void => {
  if (token) {
    // Сохраняем в localStorage
    localStorage.setItem('token', token);
    
    // Устанавливаем для всех запросов axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    removeAuthToken();
  }
};

/**
 * Удаление токена авторизации из localStorage и настроек axios
 */
export const removeAuthToken = (): void => {
  // Удаляем из localStorage
  localStorage.removeItem('token');
  
  // Удаляем из настроек axios
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * Получение токена авторизации из localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Установка перехватчиков axios для обработки истечения срока действия токена
 */
export const setupAxiosInterceptors = (store: any): void => {
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
          // Пытаемся обновить токен
          await store.dispatch({ type: 'auth/refreshToken' });
          
          // Если токен был успешно обновлен, повторяем исходный запрос
          const token = getToken();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch (error) {
          // Если что-то пошло не так при обновлении токена, выход пользователя
          store.dispatch({ type: 'auth/logout' });
          return Promise.reject(new Error('Аутентификация не удалась. Пожалуйста, войдите снова.'));
        }
      }
      
      return Promise.reject(error);
    }
  );
};