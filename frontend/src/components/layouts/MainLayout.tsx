// src/components/layouts/MainLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LogoutButton from '../ui/LogoutButton';

const MainLayout: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { current: character } = useSelector((state: any) => state.character);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex justify-between items-center px-8 py-4 bg-background shadow-md">
        <div className="font-display text-3xl font-bold">
          <Link to="/" className="text-primary hover:text-primary/90">Echo Dragons</Link>
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="text-text-primary hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">Главная</Link>
            </li>
            {character ? (
              <>
                <li>
                  <Link to="/battle" className="text-text-primary hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">Битвы</Link>
                </li>
                <li>
                  <Link to="/inventory" className="text-text-primary hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">Инвентарь</Link>
                </li>
                <li>
                  <Link to="/quests" className="text-text-primary hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">Квесты</Link>
                </li>
              </>
            ) : (
              <li>
                <Link to="/character/select" className="text-text-primary hover:text-primary border-b-2 border-transparent hover:border-primary transition-colors">Выбор персонажа</Link>
              </li>
            )}
          </ul>
        </nav>
        
        <div className="flex items-center">
          {character && (
            <div className="flex flex-col items-end mr-6">
              <span className="font-bold text-primary">{character.name}</span>
              <span className="text-sm text-text-secondary">Уровень {character.level}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <span className="mr-4 text-text-primary">{user?.username}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      
      <main className="flex-1 p-8 bg-background text-text-primary">
        <Outlet />
      </main>
      
      <footer className="py-4 px-8 bg-surface/80 text-text-secondary text-center text-sm">
        <div>Echo Dragons © 2025. Все права защищены.</div>
      </footer>
    </div>
  );
};

export default MainLayout;