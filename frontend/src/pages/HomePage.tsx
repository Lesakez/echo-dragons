// src/pages/HomePage.tsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user } = useSelector((state: any) => state.auth);
  const { current: character } = useSelector((state: any) => state.character);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12 py-12 px-4 rounded-lg bg-gradient-to-r from-background/90 to-background/70 bg-cover bg-center relative">
        <div className="absolute inset-0 bg-black/20 rounded-lg -z-10"></div>
        <h1 className="text-5xl font-display font-bold text-primary mb-4 drop-shadow-md">Добро пожаловать в Echo Dragons</h1>
        <p className="text-2xl max-w-3xl mx-auto mb-8">Сразись с монстрами, выполняй квесты и стань легендой!</p>
        
        {!character && (
          <div className="flex justify-center gap-6">
            <Link to="/character/create" className="px-6 py-3 text-xl bg-primary text-background font-bold rounded hover:bg-primary/90 transition-transform hover:-translate-y-1">
              Создать персонажа
            </Link>
            <Link to="/character/select" className="px-6 py-3 text-xl bg-transparent border-2 border-primary text-primary font-bold rounded hover:bg-primary/10 transition-colors">
              Выбрать существующего
            </Link>
          </div>
        )}
      </div>
      
      {character && (
        <div className="mb-12">
          <h2 className="text-3xl font-display text-primary mb-6">Быстрые действия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-surface rounded-lg p-6 shadow-card hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl text-primary mb-4">Отправиться в бой</h3>
              <p className="text-text-secondary mb-6">Сразись с монстрами или другими игроками</p>
              <Link to="/battle" className="inline-block px-4 py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/80 transition-colors">
                В бой!
              </Link>
            </div>
            
            <div className="bg-surface rounded-lg p-6 shadow-card hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl text-primary mb-4">Активные квесты</h3>
              <p className="text-text-secondary mb-6">У вас есть {0} активных квестов</p>
              <Link to="/quests" className="inline-block px-4 py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/80 transition-colors">
                К квестам
              </Link>
            </div>
            
            <div className="bg-surface rounded-lg p-6 shadow-card hover:-translate-y-2 transition-transform">
              <h3 className="text-2xl text-primary mb-4">Управление инвентарем</h3>
              <p className="text-text-secondary mb-6">Экипировать и улучшать предметы</p>
              <Link to="/inventory" className="inline-block px-4 py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/80 transition-colors">
                Инвентарь
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-3xl font-display text-primary mb-6">Последние новости</h2>
        <div className="space-y-6">
          <div className="bg-surface/50 rounded-lg p-6">
            <h3 className="text-xl text-primary mb-2">Открытие новой локации</h3>
            <p className="text-sm text-text-secondary mb-2">28 апреля 2025</p>
            <p>Исследуйте загадочные Сумеречные пещеры! Новая локация доступна для игроков 20+ уровня.</p>
          </div>
          
          <div className="bg-surface/50 rounded-lg p-6">
            <h3 className="text-xl text-primary mb-2">Праздничное событие</h3>
            <p className="text-sm text-text-secondary mb-2">24 апреля 2025</p>
            <p>Весенний фестиваль начинается! Присоединяйтесь к уникальным заданиям и получайте эксклюзивные награды.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;