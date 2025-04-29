// src/pages/BattlePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../services/socketService';
import { startPvEBattle, performAction, updateBattle, endBattle } from '../store/slices/battleSlice';
import BattleScene from '../components/game/Battle/BattleScene';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BattleState, BattleStatus } from '../types/battle';

const BattlePage: React.FC = () => {
  const { battleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const { user } = useSelector((state: any) => state.auth);
  const { current: character } = useSelector((state: any) => state.character);
  const { currentBattle, loading, error, battleResult } = useSelector((state: any) => state.battle);
  
  // Подключение к серверу и инициализация боя
  useEffect(() => {
    if (!character) {
      navigate('/character/select');
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    
    // Подключаемся к сокету
    socket.connect();
    
    // Устанавливаем обработчики событий для боя
    socket.on('battle:update', (updatedBattle: BattleState) => {
      dispatch(updateBattle(updatedBattle));
    });
    
    socket.on('battle:end', (result: any) => {
      dispatch(endBattle(result));
    });
    
    // Инициализируем или подключаемся к бою
    const initBattle = async () => {
      try {
        if (battleId) {
          // Подключаемся к существующему бою
          socket.emit('battle:join', { battleId: parseInt(battleId), characterId: character.id });
        } else {
          // Инициируем новый PvE бой с реальными монстрами
          dispatch(startPvEBattle({ 
            characterId: character.id, 
            // По умолчанию сражаемся с гоблинами - ID берутся из БД
            monsterIds: [1, 2]
          }));
        }
        setIsConnecting(false);
      } catch (err) {
        console.error('Battle initialization error:', err);
        setConnectionError('Не удалось инициализировать бой. Пожалуйста, попробуйте позже.');
        setIsConnecting(false);
      }
    };
    
    initBattle();
    
    // Очистка при размонтировании
    return () => {
      socket.off('battle:update');
      socket.off('battle:end');
      
      if (currentBattle) {
        socket.emit('battle:leave', { 
          battleId: currentBattle.id, 
          characterId: character.id 
        });
      }
      
      socket.disconnect();
    };
  }, [character, battleId, dispatch, navigate]);
  
  // Обработка действий пользователя
  const handleAction = (participantId: number, action: any) => {
    if (!currentBattle) return;
    
    dispatch(performAction({
      battleId: currentBattle.id,
      participantId,
      action
    }));
  };
  
  // Перенаправление на главную в случае завершения боя
  useEffect(() => {
    if (battleResult) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [battleResult, navigate]);
  
  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-xl mb-4">Для участия в боях необходимо выбрать персонажа</p>
        <button
          onClick={() => navigate('/character/select')}
          className="px-4 py-2 bg-primary text-background font-bold rounded hover:bg-primary/90 transition-colors"
        >
          Выбрать персонажа
        </button>
      </div>
    );
  }
  
  if (isConnecting || loading) {
    return <LoadingSpinner />;
  }
  
  if (connectionError || error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="p-4 mb-6 bg-accent/20 border border-accent rounded-md text-accent max-w-xl w-full text-center">
          {connectionError || error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-secondary/80 transition-colors"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }
  
  if (!currentBattle) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-xl mb-4">Инициализация боя...</p>
        <LoadingSpinner />
      </div>
    );
  }
  
  // Отображаем результаты боя, если он завершен
  if (battleResult) {
    const isVictory = battleResult.status === BattleStatus.VICTORY;
    
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className={`text-3xl font-display mb-6 ${isVictory ? 'text-green-500' : 'text-accent'}`}>
          {isVictory ? 'Победа!' : 'Поражение!'}
        </h2>
        
        {battleResult.rewards && (
          <div className="bg-surface rounded-lg p-6 mb-6 max-w-xl w-full">
            <h3 className="text-xl text-primary mb-4">Награды:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary">Опыт:</p>
                <p className="text-xl">{battleResult.rewards.experience}</p>
              </div>
              <div>
                <p className="text-text-secondary">Золото:</p>
                <p className="text-xl">{battleResult.rewards.gold}</p>
              </div>
            </div>
            
            {battleResult.rewards.items.length > 0 && (
              <div className="mt-4">
                <p className="text-text-secondary mb-2">Предметы:</p>
                <ul className="space-y-1">
                  {battleResult.rewards.items.map((item: any, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="text-primary">{item.name}</span>
                      <span className="ml-auto text-text-secondary">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <p className="text-text-secondary mb-6">Перенаправление на главную через несколько секунд...</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-background font-bold rounded hover:bg-primary/90 transition-colors"
        >
          На главную
        </button>
      </div>
    );
  }
  
  // Отображаем боевой интерфейс
  return (
    <div className="p-4">
      <BattleScene
        socket={socket}
        handleAction={handleAction}
      />
    </div>
  );
};

export default BattlePage;