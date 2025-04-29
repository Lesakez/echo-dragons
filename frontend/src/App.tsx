// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getToken, setupAxiosInterceptors } from './utils/auth';
import { loadUser } from './store/slices/authSlice';
import { configureStore } from './store';

// Компоненты аутентификации
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AuthGuard from './components/auth/AuthGuard';

// Основные компоненты
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import BattlePage from './pages/BattlePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Инициализация хранилища
const store = configureStore();

// Настройка перехватчиков для axios
setupAxiosInterceptors(store);

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Проверяем наличие токена при загрузке приложения
    const token = getToken();
    if (token) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Публичные маршруты (не требуют аутентификации) */}
        <Route element={<AuthGuard requiresAuth={false} />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        {/* Защищенные маршруты (требуют аутентификации) */}
        <Route element={<AuthGuard requiresAuth={true} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/create" element={<CreateCharacterPage />} />
            <Route path="/character/select" element={<CharacterSelectPage />} />
            <Route path="/battle/:battleId" element={<BattlePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Обработка несуществующих маршрутов */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
};

export default App;