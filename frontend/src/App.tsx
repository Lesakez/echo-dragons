// frontend/src/App.tsx - Fixing type issues

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import { getToken, setupAxiosInterceptors } from './utils/auth';
import { loadUser } from './store/slices/authSlice';
import { configureStore } from './store/index';
import { AppDispatch } from './types/redux';

// Auth components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AuthGuard from './components/auth/AuthGuard';

// Main components
import MainLayout from './components/layouts/MainLayout';
import HomePage from './pages/HomePage';
// Import directly with file extension to make TypeScript recognize it as a module
import CreateCharacterPage from './pages/CreateCharacterPage'; 
import CharacterSelectPage from './pages/CharacterSelectPage';
// Import with explicit default export reference
import BattlePage from './pages/BattlePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Initialize store
const store = configureStore();

// Set up axios interceptors
setupAxiosInterceptors(store);

const AppContent: React.FC = () => {
  // Use properly typed dispatch
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check for token on app load
    const token = getToken();
    if (token) {
      // Use properly typed dispatch for the loadUser async thunk
      dispatch(loadUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public routes (don't require authentication) */}
        <Route element={<AuthGuard requiresAuth={false} />}>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Route>

        {/* Protected routes (require authentication) */}
        <Route element={<AuthGuard requiresAuth={true} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/character/create" element={<CreateCharacterPage />} />
            <Route path="/character/select" element={<CharacterSelectPage />} />
            <Route path="/battle/:battleId" element={<BattlePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Handle non-existent routes */}
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