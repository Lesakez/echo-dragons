// frontend/src/components/ui/LogoutButton.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../types/redux';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Using typed dispatch to match the logout action creator
    dispatch(logout());
    navigate('/login');
  };

  return (
    <button 
      className={`py-2 px-4 bg-transparent border-2 border-accent text-accent font-bold rounded hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors ${className}`}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;