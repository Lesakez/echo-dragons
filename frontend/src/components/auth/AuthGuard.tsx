// frontend/src/components/auth/AuthGuard.tsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getToken } from '../../utils/auth';
import { AppDispatch } from '../../types/redux';

interface AuthGuardProps {
  requiresAuth?: boolean;
}

/**
 * AuthGuard - Компонент для защиты маршрутов, требующих аутентификации.
 * Если пользователь не аутентифицирован, перенаправляет на страницу входа.
 * Если маршрут не требует аутентификации, а пользователь уже вошел в систему,
 * перенаправляет на домашнюю страницу (например, со страницы входа).
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ requiresAuth = true }) => {
  // Используем селектор для доступа к данным аутентификации
  const authState = useSelector((state: any) => state.auth);
  const { isAuthenticated, loading, user } = authState;
  
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    
    // Загружаем данные пользователя только если:
    // 1. У нас есть токен
    // 2. У нас еще нет данных пользователя
    // 3. Мы не загружаем данные в данный момент
    // 4. Мы находимся на защищенном маршруте или явно запрашиваем проверку аутентификации
    if (token && !user && !loading && requiresAuth) {
      dispatch(loadUser());
    }
  }, [dispatch, user, loading, requiresAuth]);

  // Показываем индикатор загрузки при проверке аутентификации
  if (loading) {
    return <LoadingSpinner />;
  }

  // Если маршрут требует аутентификации, а пользователь не аутентифицирован
  if (requiresAuth && !isAuthenticated) {
    // Перенаправляем на страницу входа с URL возврата
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Если маршрут не требует аутентификации, а пользователь уже аутентифицирован
  // (например, страницы входа/регистрации)
  if (!requiresAuth && isAuthenticated) {
    // Перенаправляем на домашнюю страницу или на страницу, к которой пользователь пытался получить доступ
    const from = location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  // В остальных случаях отображаем защищенный контент
  return <Outlet />;
};

export default AuthGuard;