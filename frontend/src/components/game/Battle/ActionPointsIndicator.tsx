// src/components/game/Battle/ActionPointsIndicator.tsx
import React from 'react';
import { Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface ActionPointsIndicatorProps {
  current: number;
  max: number;
  position: [number, number];
}

const ActionPointsIndicator: React.FC<ActionPointsIndicatorProps> = ({ current, max, position }) => {
  const draw = (g: PIXI.Graphics) => {
    g.clear();
    
    const width = 40;
    const height = 8;
    const spacing = 2;
    const pointWidth = (width - (spacing * (max - 1))) / max;
    
    for (let i = 0; i < max; i++) {
      const x = (i * (pointWidth + spacing)) - (width / 2);
      const y = 0;
      
      // Заполняем точки действий в зависимости от того, доступны они или нет
      if (i < current) {
        g.beginFill(0xf8c51c); // Жёлтый цвет для активных ОД
      } else {
        g.beginFill(0x555555); // Серый цвет для использованных ОД
      }
      
      // Рисуем точку действия
      g.drawRect(x, y, pointWidth, height);
      g.endFill();
    }
  };
  
  return (
    <Container position={position}>
      <Graphics draw={draw} />
    </Container>
  );
};

export default ActionPointsIndicator;