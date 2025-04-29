// src/components/game/UI/HealthBar.tsx
import React from 'react';
import { Container, Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';

interface HealthBarProps {
  current: number;
  max: number;
  width: number;
  x?: number;
  y?: number;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, width, x = 0, y = 0 }) => {
  const percent = Math.max(0, Math.min(1, current / max));
  
  // Определяем цвет в зависимости от процента здоровья
  const getHealthColor = () => {
    if (percent > 0.6) return 0x00ff00; // Зеленый для высокого здоровья
    if (percent > 0.3) return 0xffff00; // Желтый для среднего здоровья
    return 0xff0000; // Красный для низкого здоровья
  };
  
  // Функция для отрисовки полосы здоровья
  const drawHealthBar = (g: PIXI.Graphics) => {
    g.clear();
    
    // Рисуем фон
    g.beginFill(0x333333);
    g.drawRect(x, y, width, 8);
    g.endFill();
    
    // Рисуем текущее здоровье
    g.beginFill(getHealthColor());
    g.drawRect(x, y, width * percent, 8);
    g.endFill();
    
    // Рисуем рамку
    g.lineStyle(1, 0x000000, 1);
    g.drawRect(x, y, width, 8);
  };
  
  return (
    <Container>
      <Graphics draw={drawHealthBar} />
    </Container>
  );
};

export default HealthBar;