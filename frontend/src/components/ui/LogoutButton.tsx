// src/components/ui/LogoutButton.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

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
      className={`py-2 px-4 bg-transparent border-2 border-accent text-accent font-bold rounded hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors ${className}`}
      onClick={handleLogout}
    >
      Выйти
    </button>
  );
};

export default LogoutButton;