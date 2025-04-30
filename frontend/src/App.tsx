// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Provider } from 'react-redux';
import { getToken } from './utils/auth';
import { loadUser } from './store/slices/authSlice';
import { configureStore } from './store';
import { AppDispatch } from './types/redux';
// Импорт модуля перехватчиков
import './utils/setupInterceptors';

// Auth components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AuthGuard from './components/auth/AuthGuard';

// Main components
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
import CreateCharacterPage from './pages/CreateCharacterPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import BattlePage from './pages/BattlePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Initialize store
const store = configureStore();

const AppContent: React.FC = () => {
  // Используем dispatch с правильным типом
  const dispatch = useDispatch<AppDispatch>();
  
  // Используем селектор для доступа к данным аутентификации
  const authState = useSelector((state: any) => state.auth);
  const { isAuthenticated, loading } = authState;

  useEffect(() => {
    // Проверяем наличие токена и не загружены ли уже данные пользователя
    const token = getToken();
    if (token && !isAuthenticated && !loading) {
      dispatch(loadUser());
    }
  }, [dispatch, isAuthenticated, loading]);

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
            <Route path="/battle" element={<BattlePage />} />
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

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;