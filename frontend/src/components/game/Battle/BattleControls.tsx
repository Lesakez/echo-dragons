// src/components/game/Battle/BattleControls.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { BattleParticipantState } from '../../../types/battle';

interface BattleControlsProps {
  participant: BattleParticipantState;
  onAttack: () => void;
  onBlock: () => void;
  onUseSkill: (skillId: number) => void;
  onUseItem: (itemId: number) => void;
  onFlee: () => void;
  onEndTurn: () => void;
  canAttack: boolean;
  canBlock: boolean;
  selectedTarget: number | null;
}

const BattleControls: React.FC<BattleControlsProps> = ({
  participant,
  onAttack,
  onBlock,
  onUseSkill,
  onUseItem,
  onFlee,
  onEndTurn,
  canAttack,
  canBlock,
  selectedTarget
}) => {
  const [showSkills, setShowSkills] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [stanceSelection, setStanceSelection] = useState<'offensive' | 'defensive' | 'balanced' | null>(null);
  
  const skills = useSelector((state: any) => state.character.skills || []);
  const inventory = useSelector((state: any) => state.character.inventory || []);
  
  // Фильтруем предметы, которые можно использовать в бою
  const availableItems = inventory.filter((item: any) => 
    item && item.usableInBattle && (
      !selectedTarget || // Самолечение
      item.canTargetEnemy || // Можно использовать на враге
      item.canTargetAlly // Можно использовать на союзнике
    )
  );
  
  const handleStanceChange = () => {
    // В реальной системе здесь был бы dispatch для изменения стойки
    if (stanceSelection) {
      console.log(`Изменение стойки на ${stanceSelection}`);
      setStanceSelection(null);
    }
  };
  
  return (
    <div className="bg-background p-4 rounded-lg">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        <button 
          className={`p-2 rounded font-bold ${canAttack ? 'bg-primary text-background' : 'bg-gray-700 text-gray-500'}`}
          onClick={onAttack}
          disabled={!canAttack}
        >
          Атака (2 ОД)
        </button>
        
        <button 
          className={`p-2 rounded font-bold ${canBlock ? 'bg-secondary text-white' : 'bg-gray-700 text-gray-500'}`}
          onClick={onBlock}
          disabled={!canBlock}
        >
          Блок (1 ОД)
        </button>
        
        <button 
          className="p-2 rounded font-bold bg-blue-600 text-white"
          onClick={() => setShowSkills(!showSkills)}
        >
          Навыки
        </button>
        
        <button 
          className="p-2 rounded font-bold bg-yellow-600 text-white"
          onClick={() => setShowItems(!showItems)}
        >
          Предметы
        </button>
        
        <button 
          className="p-2 rounded font-bold bg-red-600 text-white"
          onClick={onFlee}
        >
          Бегство (5 ОД)
        </button>
        
        <button 
          className="p-2 rounded font-bold bg-gray-600 text-white"
          onClick={onEndTurn}
        >
          Завершить ход
        </button>
      </div>
      
      {showSkills && (
        <div className="bg-surface p-4 rounded-lg mb-4">
          <h4 className="font-bold text-primary mb-2">Доступные навыки:</h4>
          {skills.length === 0 ? (
            <div className="text-text-secondary">У вас нет доступных навыков</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {skills.map((skill: any) => (
                <div 
                  key={skill.id}
                  className={`p-2 border rounded flex items-start cursor-pointer transition-colors ${
                    skill.manaCost > participant.mana || participant.actionPoints < 3
                      ? 'border-gray-700 text-gray-500 opacity-50'
                      : 'border-blue-500 hover:bg-blue-500/10'
                  }`}
                  onClick={() => {
                    if (skill.manaCost <= participant.mana && participant.actionPoints >= 3) {
                      onUseSkill(skill.id);
                      setShowSkills(false);
                    }
                  }}
                >
                  <div className="mr-2">
                    <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white">
                      {skill.icon || '✨'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{skill.name}</div>
                    <div className="text-xs text-text-secondary">Мана: {skill.manaCost} | ОД: 3</div>
                    <div className="text-xs text-text-secondary">{skill.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            className="w-full mt-3 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            onClick={() => setShowSkills(false)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      {showItems && (
        <div className="bg-surface p-4 rounded-lg mb-4">
          <h4 className="font-bold text-primary mb-2">Доступные предметы:</h4>
          {availableItems.length === 0 ? (
            <div className="text-text-secondary">У вас нет доступных предметов</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableItems.map((item: any) => (
                <div 
                  key={item.id}
                  className={`p-2 border rounded flex items-start cursor-pointer transition-colors ${
                    participant.actionPoints < 1
                      ? 'border-gray-700 text-gray-500 opacity-50'
                      : 'border-yellow-500 hover:bg-yellow-500/10'
                  }`}
                  onClick={() => {
                    if (participant.actionPoints >= 1) {
                      onUseItem(item.id);
                      setShowItems(false);
                    }
                  }}
                >
                  <div className="mr-2">
                    <div className="w-8 h-8 bg-yellow-900 rounded-full flex items-center justify-center text-white">
                      {item.icon || '🧪'}
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-text-secondary">{item.type}</div>
                    <div className="text-xs text-text-secondary">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            className="w-full mt-3 p-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            onClick={() => setShowItems(false)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      <div className="bg-surface p-4 rounded-lg">
        <h4 className="font-bold text-primary mb-2">Стойка: {participant.stance === 'offensive' ? 'Атакующая' : participant.stance === 'defensive' ? 'Защитная' : 'Универсальная'}</h4>
        <div className="grid grid-cols-3 gap-2">
          <div 
            className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
              stanceSelection === 'offensive' || (participant.stance === 'offensive' && !stanceSelection)
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-gray-700 hover:border-primary/50'
            }`}
            onClick={() => setStanceSelection('offensive')}
          >
            <div className="text-xl mb-1">⚔️</div>
            <div>Атакующая</div>
          </div>
          
          <div 
            className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
              stanceSelection === 'balanced' || (participant.stance === 'balanced' && !stanceSelection)
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-gray-700 hover:border-primary/50'
            }`}
            onClick={() => setStanceSelection('balanced')}
          >
            <div className="text-xl mb-1">⚖️</div>
            <div>Универсальная</div>
          </div>
          
          <div 
            className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
              stanceSelection === 'defensive' || (participant.stance === 'defensive' && !stanceSelection)
                ? 'border-primary bg-primary/20 text-primary'
                : 'border-gray-700 hover:border-primary/50'
            }`}
            onClick={() => setStanceSelection('defensive')}
          >
            <div className="text-xl mb-1">🛡️</div>
            <div>Защитная</div>
          </div>
        </div>
        
        {stanceSelection && stanceSelection !== participant.stance && (
          <button 
            className="w-full mt-3 p-2 bg-primary text-background rounded font-bold hover:bg-primary/90 transition-colors"
            onClick={handleStanceChange}
          >
            Изменить стойку (1 ОД)
          </button>
        )}
      </div>
    </div>
  );
};

export default BattleControls;