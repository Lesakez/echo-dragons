// frontend/src/components/auth/AuthGuard.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { loadUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AppDispatch } from '../../types/redux';

interface AuthGuardProps {
  requiresAuth?: boolean;
}

/**
 * AuthGuard - Component to protect routes requiring authentication.
 * If user is not authenticated, redirects to login page.
 * If route doesn't require authentication and user is already logged in,
 * redirects to home page (e.g. from login page).
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ requiresAuth = true }) => {
  const { isAuthenticated, loading, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    // If we have a token but no user data, load it
    const token = localStorage.getItem('token');
    if (token && !user && !loading) {
      // Using loadUser as an action creator directly with AppDispatch type
      dispatch(loadUser());
    }
  }, [dispatch, user, loading]);

  // Show loading indicator while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route doesn't require auth and user is already authenticated
  // (e.g. login/register pages)
  if (!requiresAuth && isAuthenticated) {
    // Redirect to home page
    return <Navigate to="/" replace />;
  }

  // Otherwise render the protected content
  return <Outlet />;
};

export default AuthGuard;