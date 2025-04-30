// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullScreen = false,
  text = 'Загрузка...' 
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 border-2';
      case 'lg': return 'w-16 h-16 border-4';
      case 'md':
      default: return 'w-10 h-10 border-3';
    }
  };

  const spinner = (
    <div className="inline-flex flex-col items-center justify-center">
      <div className={`${getSpinnerSize()} rounded-full border-primary border-t-transparent animate-spin`}></div>
      {text && <p className="mt-3 text-text-secondary">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;