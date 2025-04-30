// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean; // Добавляет эффект при наведении
  bordered?: boolean; // Добавляет рамку
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  bordered = false,
}) => {
  // Базовые стили карточки
  let cardClasses = 'bg-surface rounded-lg p-6 shadow-card';
  
  // Добавление эффекта при наведении
  if (hover) {
    cardClasses += ' transition-transform duration-300 hover:-translate-y-2';
  }
  
  // Добавление рамки
  if (bordered) {
    cardClasses += ' border border-surface/80 hover:border-primary/30';
  }
  
  // Добавление дополнительных классов
  cardClasses += ` ${className}`;
  
  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
};

export default Card;