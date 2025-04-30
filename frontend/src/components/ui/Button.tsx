// src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  // Базовые стили для всех кнопок
  let buttonClasses = 'font-bold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Стили для разных вариантов
  const variantClasses = {
    primary: 'bg-primary text-background hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
    danger: 'bg-accent text-white hover:bg-accent/90 focus:ring-accent/50',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary/30',
  };
  
  // Стили для разных размеров
  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };
  
  // Стили для полной ширины
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Стили для отключенной кнопки
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Компоновка всех классов
  buttonClasses = `${buttonClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;