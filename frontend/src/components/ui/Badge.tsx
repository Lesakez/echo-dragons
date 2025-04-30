// src/components/ui/Badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  className = '',
}) => {
  // Базовые стили
  let badgeClasses = 'inline-flex items-center justify-center font-semibold';
  
  // Варианты цветов
  const variantClasses = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-accent/20 text-accent',
    info: 'bg-info/20 text-info',
  };
  
  // Размеры
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  // Скругление
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  badgeClasses = `${badgeClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClass} ${className}`;
  
  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default Badge;