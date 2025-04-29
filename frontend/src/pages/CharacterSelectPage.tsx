// src/pages/CharacterSelectPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { API_URL } from '../../config';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface Character {
  id: number;
  name: string;
  level: number;
  class: string;
  faction: string;
}

const CharacterSelectPage: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/characters`);
        setCharacters(response.data);
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить список персонажей. Пожалуйста, попробуйте позже.');
        console.error('Error fetching characters:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCharacters();
  }, []);
  
  const handleSelectCharacter = async (characterId: number) => {
    try {
      setLoading(true);
      // В реальном приложении здесь был бы запрос к API для выбора персонажа
      // const response = await axios.post(`${API_URL}/characters/${characterId}/select`);
      
      // Для демонстрации просто эмулируем задержку
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Обновляем состояние в Redux
      const selectedCharacter = characters.find(char => char.id === characterId);
      if (selectedCharacter) {
        dispatch({ type: 'character/setCurrentCharacter', payload: selectedCharacter });
      }
      
      // Перенаправляем на главную страницу
      navigate('/');
    } catch (err) {
      setError('Не удалось выбрать персонажа. Пожалуйста, попробуйте позже.');
      console.error('Error selecting character:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const getClassIcon = (characterClass: string) => {
    switch (characterClass.toLowerCase()) {
      case 'warrior': return '🛡️';
      case 'mage': return '🔮';
      case 'rogue': return '🗡️';
      case 'priest': return '✨';
      default: return '👤';
    }
  };
  
  const getFactionColor = (faction: string) => {
    return faction.toLowerCase() === 'avrelia' ? 'bg-blue-500' : 'bg-red-500';
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-display text-primary mb-8">Выбор персонажа</h1>
      
      {error && (
        <div className="p-4 mb-6 bg-accent/20 border border-accent rounded-md text-accent">
          {error}
        </div>
      )}
      
      {characters.length === 0 ? (
        <div className="bg-surface rounded-lg p-8 text-center shadow-card">
          <h2 className="text-2xl text-primary mb-4">У вас пока нет персонажей</h2>
          <p className="mb-6 text-text-secondary">Создайте своего первого персонажа, чтобы начать приключение.</p>
          <Link 
            to="/character/create" 
            className="px-6 py-3 bg-primary text-background font-bold rounded-md hover:bg-primary/90 transition-colors"
          >
            Создать персонажа
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {characters.map(character => (
            <div 
              key={character.id} 
              className="bg-surface rounded-lg p-6 shadow-card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-2xl mr-4">
                  {getClassIcon(character.class)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{character.name}</h3>
                  <div className="flex items-center">
                    <span className="text-text-secondary mr-2">Уровень {character.level}</span>
                    <span className={`w-2 h-2 rounded-full ${getFactionColor(character.faction)}`}></span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-sm text-text-secondary">Класс</p>
                  <p className="capitalize">{character.class}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Фракция</p>
                  <p className="capitalize">{character.faction}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleSelectCharacter(character.id)}
                className="w-full py-2 bg-secondary text-white rounded font-bold hover:bg-secondary/80 transition-colors"
              >
                Выбрать персонажа
              </button>
            </div>
          ))}
          
          <div className="bg-surface/50 rounded-lg p-6 border-2 border-dashed border-text-secondary flex flex-col items-center justify-center h-full">
            <p className="text-text-secondary mb-4 text-center">Создайте нового персонажа, чтобы расширить свои возможности</p>
            <Link 
              to="/character/create" 
              className="px-4 py-2 bg-primary text-background font-bold rounded-md hover:bg-primary/90 transition-colors"
            >
              Создать персонажа
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterSelectPage;