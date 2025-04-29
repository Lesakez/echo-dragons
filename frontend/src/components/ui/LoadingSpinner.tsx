// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner">
        <div></div><div></div><div></div><div></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;