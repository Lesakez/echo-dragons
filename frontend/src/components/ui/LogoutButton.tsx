// src/components/auth/LogoutButton.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import './LogoutButton.scss';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <button 
      className={`logout-button ${className}`}
      onClick={handleLogout}
    >
      Выйти
    </button>
  );
};

export default LogoutButton;