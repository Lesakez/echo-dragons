// src/components/game/Battle/ParticipantInfo.tsx
import React from 'react';
import { BattleParticipantState } from '../../../types/battle';

interface ParticipantInfoProps {
  participant: BattleParticipantState;
}

const ParticipantInfo: React.FC<ParticipantInfoProps> = ({ participant }) => {
  return (
    <div className="participant-info">
      <div className="participant-header">
        <div className="participant-name">{participant.name}</div>
        <div className="participant-type">{participant.type === 'character' ? 'Персонаж' : 'Монстр'}</div>
      </div>
      
      <div className="participant-stats">
        <div className="stat">
          <span className="stat-label">Здоровье:</span>
          <span className="stat-value">{participant.health} / {participant.maxHealth}</span>
        </div>
        
        {participant.maxMana > 0 && (
          <div className="stat">
            <span className="stat-label">Мана:</span>
            <span className="stat-value">{participant.mana} / {participant.maxMana}</span>
          </div>
        )}
        
        <div className="stat">
          <span className="stat-label">ОД:</span>
          <span className="stat-value">{participant.actionPoints} / {participant.maxActionPoints}</span>
        </div>
        
        <div className="stat">
          <span className="stat-label">Стойка:</span>
          <span className="stat-value">{
            participant.stance === 'offensive' ? 'Атакующая' :
            participant.stance === 'defensive' ? 'Защитная' : 'Универсальная'
          }</span>
        </div>
      </div>
      
      {participant.effects.length > 0 && (
        <div className="participant-effects">
          <div className="effects-header">Активные эффекты:</div>
          <div className="effects-list">
            {participant.effects.map(effect => (
              <div className="effect" key={effect.id}>
                <span className="effect-name">{effect.name}</span>
                <span className="effect-duration">{effect.remainingTurns} {
                  effect.remainingTurns === 1 ? 'ход' :
                  effect.remainingTurns < 5 ? 'хода' : 'ходов'
                }</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantInfo;