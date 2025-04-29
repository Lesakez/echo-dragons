// src/pages/ProfilePage.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { current: character } = useSelector((state: any) => state.character);

  if (!user) {
    return <div className="text-center p-8">Загрузка данных профиля...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display text-primary mb-8">Профиль игрока</h1>
      
      <div className="bg-surface rounded-lg p-6 mb-8 shadow-card">
        <h2 className="text-2xl text-primary mb-4">Информация об аккаунте</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-text-secondary mb-1">Имя пользователя:</p>
            <p className="text-xl">{user.username}</p>
          </div>
          
          <div>
            <p className="text-text-secondary mb-1">Email:</p>
            <p className="text-xl">{user.email}</p>
          </div>
          
          <div>
            <p className="text-text-secondary mb-1">Дата регистрации:</p>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <p className="text-text-secondary mb-1">Последний вход:</p>
            <p>{new Date(user.lastLogin).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {character ? (
        <div className="bg-surface rounded-lg p-6 shadow-card">
          <h2 className="text-2xl text-primary mb-4">Активный персонаж</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-text-secondary mb-1">Имя:</p>
              <p className="text-xl">{character.name}</p>
            </div>
            
            <div>
              <p className="text-text-secondary mb-1">Класс:</p>
              <p className="text-xl">{character.class}</p>
            </div>
            
            <div>
              <p className="text-text-secondary mb-1">Уровень:</p>
              <p className="text-xl">{character.level}</p>
            </div>
            
            <div>
              <p className="text-text-secondary mb-1">Фракция:</p>
              <p className="text-xl">{character.faction}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              to="/character/select" 
              className="px-4 py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/80 transition-colors"
            >
              Сменить персонажа
            </Link>
            <Link 
              to="/character/create" 
              className="px-4 py-2 bg-transparent border-2 border-primary text-primary rounded font-bold hover:bg-primary/10 transition-colors"
            >
              Создать нового
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-lg p-6 shadow-card text-center">
          <h2 className="text-2xl text-primary mb-4">У вас нет активного персонажа</h2>
          <p className="mb-6 text-text-secondary">Создайте нового персонажа или выберите существующего, чтобы начать игру.</p>
          
          <div className="flex justify-center space-x-4">
            <Link 
              to="/character/create" 
              className="px-4 py-2 bg-primary text-background rounded font-bold hover:bg-primary/90 transition-colors"
            >
              Создать персонажа
            </Link>
            <Link 
              to="/character/select" 
              className="px-4 py-2 bg-transparent border-2 border-primary text-primary rounded font-bold hover:bg-primary/10 transition-colors"
            >
              Выбрать персонажа
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;