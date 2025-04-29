// src/components/game/Battle/BattleLog.tsx
import React, { useRef, useEffect } from 'react';
import './BattleLog.scss';

interface BattleLogProps {
  logs: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Автоматическая прокрутка к последним сообщениям
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  return (
    <div className="battle-log">
      <h3>Журнал боя</h3>
      <div className="log-entries">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`log-entry ${log.includes('побежден') ? 'defeat' : ''} ${log.includes('Ход') ? 'turn-indicator' : ''}`}
          >
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  );
};

export default BattleLog;