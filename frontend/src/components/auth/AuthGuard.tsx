// src/components/auth/AuthGuard.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { loadUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../ui/LoadingSpinner';

interface AuthGuardProps {
  requiresAuth?: boolean;
}

/**
 * AuthGuard - компонент для защиты маршрутов, требующих аутентификации.
 * Если пользователь не аутентифицирован, перенаправляет на страницу входа.
 * Если маршрут не требует аутентификации и пользователь уже вошел, 
 * перенаправляет на домашнюю страницу (например, со страницы входа).
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ requiresAuth = true }) => {
  const { isAuthenticated, loading, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    // Если у нас есть токен, но нет данных о пользователе, загружаем их
    const token = localStorage.getItem('token');
    if (token && !user && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, user, loading]);

  // Показываем индикатор загрузки, пока проверяем аутентификацию
  if (loading) {
    return <LoadingSpinner />;
  }

  // Если маршрут требует аутентификации и пользователь не аутентифицирован
  if (requiresAuth && !isAuthenticated) {
    // Перенаправляем на страницу входа с возвратом на текущий URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если маршрут не требует аутентификации и пользователь уже аутентифицирован
  // (например, страницы входа/регистрации)
  if (!requiresAuth && isAuthenticated) {
    // Перенаправляем на домашнюю страницу
    return <Navigate to="/" replace />;
  }

  // В противном случае отображаем защищенный контент
  return <Outlet />;
};

export default AuthGuard;