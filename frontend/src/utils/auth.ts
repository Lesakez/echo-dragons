// src/utils/auth.ts
import axios from 'axios';
import { refreshToken, logout } from '../store/slices/authSlice';

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const removeAuthToken = () => {
  delete axios.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setupAxiosInterceptors = (store: any) => {
  // Interceptor для обработки ответов
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Если ошибка 401 (Unauthorized) и запрос не повторный
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Пробуем обновить токен
          await store.dispatch(refreshToken());
          
          // Повторяем оригинальный запрос с новым токеном
          return axios(originalRequest);
        } catch (refreshError) {
          // Если не удалось обновить токен, разлогиниваем пользователя
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
};