// src/components/layouts/MainLayout.tsx
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { AppDispatch } from '../../types/redux';

const MainLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: any) => state.auth);
  const { current: character } = useSelector((state: any) => state.character);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Верхняя панель навигации */}
      <header className="bg-surface shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link to="/" className="text-2xl font-display text-primary">Echo Dragons</Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-text-primary hover:text-primary transition-colors">Главная</Link>
            
            {character ? (
              <>
                <Link to="/battle" className="text-text-primary hover:text-primary transition-colors">Битвы</Link>
                <Link to="/inventory" className="text-text-primary hover:text-primary transition-colors">Инвентарь</Link>
                <Link to="/quests" className="text-text-primary hover:text-primary transition-colors">Квесты</Link>
              </>
            ) : (
              <Link to="/character/select" className="text-text-primary hover:text-primary transition-colors">
                Выбор персонажа
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Информация о персонаже */}
            {character && (
              <div className="hidden md:flex items-center mr-4 bg-surface/50 rounded-lg px-3 py-1">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-background mr-2">
                  {character.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-primary">{character.name}</span>
                  <div className="flex text-xs text-text-secondary">
                    <span>Уровень {character.level}</span>
                    <span className="mx-1">•</span>
                    <span className={character.faction === 'avrelia' ? 'text-faction-avrelia' : 'text-faction-inferno'}>
                      {character.faction === 'avrelia' ? 'Аврелия' : 'Инферно'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Профиль пользователя */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-text-primary">
                <span>{user?.username}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-md shadow-lg overflow-hidden z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                <div className="py-1">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-text-primary hover:bg-background/30">
                    Профиль
                  </Link>
                  <Link to="/character/select" className="block px-4 py-2 text-sm text-text-primary hover:bg-background/30">
                    Персонажи
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-accent hover:bg-background/30"
                  >
                    Выйти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Мобильное меню */}
      <div className="md:hidden bg-surface/90 border-t border-gray-700">
        <div className="container mx-auto px-4 py-2 flex justify-between">
          <Link to="/" className="flex flex-col items-center py-1 px-2">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs text-text-secondary">Главная</span>
          </Link>
          
          <Link to="/battle" className="flex flex-col items-center py-1 px-2">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-text-secondary">Битвы</span>
          </Link>
          
          <Link to="/character/select" className="flex flex-col items-center py-1 px-2">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs text-text-secondary">Персонаж</span>
          </Link>
          
          <Link to="/profile" className="flex flex-col items-center py-1 px-2">
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-text-secondary">Профиль</span>
          </Link>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      {/* Футер */}
      <footer className="bg-surface py-4 text-center text-text-secondary text-sm">
        <div className="container mx-auto px-4">
          Echo Dragons © 2025. Все права защищены.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;