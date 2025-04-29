// src/components/ui/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center h-screen w-full bg-background/80 z-50">
      <div className="inline-block relative w-20 h-20">
        <div className="absolute w-16 h-16 m-2 rounded-full border-8 border-primary border-t-transparent animate-spin"></div>
        <div className="absolute w-16 h-16 m-2 rounded-full border-8 border-primary border-t-transparent animate-spin" style={{ animationDelay: '-0.45s' }}></div>
        <div className="absolute w-16 h-16 m-2 rounded-full border-8 border-primary border-t-transparent animate-spin" style={{ animationDelay: '-0.3s' }}></div>
        <div className="absolute w-16 h-16 m-2 rounded-full border-8 border-primary border-t-transparent animate-spin" style={{ animationDelay: '-0.15s' }}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;