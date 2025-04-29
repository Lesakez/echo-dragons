// frontend/src/components/game/Battle/BattleLog.tsx
import React, { useRef, useEffect } from 'react';

interface BattleLogProps {
  logs: string[];
}

const BattleLog: React.FC<BattleLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to latest messages
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  return (
    <div className="bg-background p-4 rounded-lg h-full max-h-96 overflow-y-auto">
      <h3 className="text-lg font-bold text-primary mb-2 sticky top-0 bg-background">Battle Log</h3>
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`p-2 rounded text-sm ${
              log.includes('defeated') 
                ? 'bg-red-900/30 text-red-400' 
                : log.includes('Turn') 
                ? 'bg-blue-900/30 text-blue-400 font-bold' 
                : 'text-text-primary'
            }`}
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