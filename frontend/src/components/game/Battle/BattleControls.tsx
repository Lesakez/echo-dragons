
// src/components/game/Battle/BattleControls.tsx
import React, { useState } from 'react';
import { BattleParticipantState } from '../../../types/battle';
import { useSelector } from 'react-redux';
import './BattleControls.scss';

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
  
  const skills = useSelector((state: any) => state.character.skills);
  const inventory = useSelector((state: any) => state.character.inventory);
  
  const availableItems = inventory.filter((item: any) => 
    item.usableInBattle && (
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
    <div className="battle-controls">
      <div className="main-actions">
        <button 
          className={`action-btn attack ${canAttack ? '' : 'disabled'}`}
          onClick={onAttack}
          disabled={!canAttack}
        >
          Атака (2 ОД)
        </button>
        
        <button 
          className={`action-btn block ${canBlock ? '' : 'disabled'}`}
          onClick={onBlock}
          disabled={!canBlock}
        >
          Блок (1 ОД)
        </button>
        
        <button 
          className="action-btn skill"
          onClick={() => setShowSkills(!showSkills)}
        >
          Навыки
        </button>
        
        <button 
          className="action-btn item"
          onClick={() => setShowItems(!showItems)}
        >
          Предметы
        </button>
        
        <button 
          className="action-btn flee"
          onClick={onFlee}
        >
          Бегство (5 ОД)
        </button>
        
        <button 
          className="action-btn end-turn"
          onClick={onEndTurn}
        >
          Завершить ход
        </button>
      </div>
      
      {showSkills && (
        <div className="skills-panel">
          <h4>Доступные навыки:</h4>
          <div className="skills-list">
            {skills.length === 0 ? (
              <div className="no-skills">У вас нет доступных навыков</div>
            ) : (
              skills.map((skill: any) => (
                <div 
                  key={skill.id}
                  className={`skill-item ${skill.manaCost > participant.mana || participant.actionPoints < 3 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (skill.manaCost <= participant.mana && participant.actionPoints >= 3) {
                      onUseSkill(skill.id);
                      setShowSkills(false);
                    }
                  }}
                >
                  <img src={`/assets/sprites/skills/${skill.icon}`} alt={skill.name} />
                  <div className="skill-info">
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-cost">Мана: {skill.manaCost} | ОД: 3</div>
                    <div className="skill-desc">{skill.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="close-btn"
            onClick={() => setShowSkills(false)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      {showItems && (
        <div className="items-panel">
          <h4>Доступные предметы:</h4>
          <div className="items-list">
            {availableItems.length === 0 ? (
              <div className="no-items">У вас нет доступных предметов</div>
            ) : (
              availableItems.map((item: any) => (
                <div 
                  key={item.id}
                  className={`item-item ${participant.actionPoints < 1 ? 'disabled' : ''}`}
                  onClick={() => {
                    if (participant.actionPoints >= 1) {
                      onUseItem(item.id);
                      setShowItems(false);
                    }
                  }}
                >
                  <img src={`/assets/sprites/items/${item.icon}`} alt={item.name} />
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-type">{item.type}</div>
                    <div className="item-desc">{item.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            className="close-btn"
            onClick={() => setShowItems(false)}
          >
            Закрыть
          </button>
        </div>
      )}
      
      <div className="stance-selector">
        <h4>Стойка: {participant.stance}</h4>
        <div className="stance-options">
          <div 
            className={`stance-option ${stanceSelection === 'offensive' || (participant.stance === 'offensive' && !stanceSelection) ? 'active' : ''}`}
            onClick={() => setStanceSelection('offensive')}
          >
            <img src="/assets/sprites/ui/stance_offensive.png" alt="Атакующая" />
            <div>Атакующая</div>
            <div className="stance-desc">+20% к урону, -10% к защите, +5% к шансу критического удара</div>
          </div>
          
          <div 
            className={`stance-option ${stanceSelection === 'balanced' || (participant.stance === 'balanced' && !stanceSelection) ? 'active' : ''}`}
            onClick={() => setStanceSelection('balanced')}
          >
            <img src="/assets/sprites/ui/stance_balanced.png" alt="Универсальная" />
            <div>Универсальная</div>
            <div className="stance-desc">+5% ко всем статам, без штрафов</div>
          </div>
          
          <div 
            className={`stance-option ${stanceSelection === 'defensive' || (participant.stance === 'defensive' && !stanceSelection) ? 'active' : ''}`}
            onClick={() => setStanceSelection('defensive')}
          >
            <img src="/assets/sprites/ui/stance_defensive.png" alt="Защитная" />
            <div>Защитная</div>
            <div className="stance-desc">-10% к урону, +25% к защите, +10% к шансу блока</div>
          </div>
        </div>
        {stanceSelection && stanceSelection !== participant.stance && (
          <button 
            className="stance-apply"
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