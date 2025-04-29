// src/components/game/UI/ManaBar.tsx
import React from 'react';
import { Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface ManaBarProps {
  current: number;
  max: number;
  width: number;
  x?: number;
  y?: number;
}

const ManaBar: React.FC<ManaBarProps> = ({ current, max, width, x = 0, y = 0 }) => {
  const percent = Math.max(0, Math.min(1, current / max));
  
  // Функция для отрисовки полосы маны
  const drawManaBar = (g: PIXI.Graphics) => {
    g.clear();
    
    // Рисуем фон
    g.beginFill(0x333333);
    g.drawRect(x, y, width, 6);
    g.endFill();
    
    // Рисуем текущую ману
    g.beginFill(0x0066ff); // Синий для маны
    g.drawRect(x, y, width * percent, 6);
    g.endFill();
    
    // Рисуем рамку
    g.lineStyle(1, 0x000000, 1);
    g.drawRect(x, y, width, 6);
  };
  
  return (
    <Container>
      <Graphics draw={drawManaBar} />
    </Container>
  );
};

export default ManaBar;
