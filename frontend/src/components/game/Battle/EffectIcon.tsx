// src/components/game/Battle/EffectIcon.tsx
import React from 'react';
import { Container, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { BattleEffect } from '../../../types/battle';

interface EffectIconProps {
  effect: BattleEffect;
  position: [number, number];
}

const EffectIcon: React.FC<EffectIconProps> = ({ effect, position }) => {
  // Определяем цвет эффекта в зависимости от типа (бафф/дебафф)
  const effectColor = effect.type === 'buff' ? 0x00ff00 : 0xff0000;
  
  // Создаем текстуру для иконки эффекта
  // Для продакшн приложения здесь будут использоваться реальные изображения
  const createEffectTexture = () => {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(effectColor, 0.7);
    graphics.drawCircle(8, 8, 8);
    graphics.endFill();
    
    return PIXI.RenderTexture.create({ width: 16, height: 16 });
  };
  
  return (
    <Container position={position}>
      <Sprite 
        texture={createEffectTexture()} 
        anchor={0.5}
      />
      <Text 
        text={effect.remainingTurns.toString()} 
        anchor={0.5}
        position={[0, 14]}
        style={new PIXI.TextStyle({
          fontFamily: 'Arial',
          fontSize: 10,
          fill: 'white'
        })}
      />
    </Container>
  );
};

export default EffectIcon;