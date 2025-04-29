// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
      <h2 className="text-3xl font-display mb-6">Страница не найдена</h2>
      <p className="text-text-secondary mb-8 max-w-md">
        Кажется, вы забрели в неизведанные земли. Эта страница не существует или была перемещена.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-background font-bold rounded-md hover:bg-primary/90 transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFoundPage;