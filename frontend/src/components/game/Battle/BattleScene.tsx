// src/components/game/Battle/BattleScene.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Container, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { Socket } from 'socket.io-client';
import './BattleScene.scss';
import { BattleState, BattleParticipantState } from '../../../types/battle';
import { performAction } from '../../../store/slices/battleSlice';
import BattleControls from './BattleControls';
import BattleLog from './BattleLog';
import HealthBar from '../UI/HealthBar';
import ManaBar from '../UI/ManaBar';
import ParticipantInfo from './ParticipantInfo';
import EffectIcon from './EffectIcon';
import ActionPointsIndicator from './ActionPointsIndicator';

interface BattleSceneProps {
  socket: Socket;
}

const BattleScene: React.FC<BattleSceneProps> = ({ socket }) => {
  const dispatch = useDispatch();
  const battle = useSelector((state: any) => state.battle.currentBattle);
  const character = useSelector((state: any) => state.character.current);
  
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<'head' | 'body' | 'waist' | 'legs' | null>(null);
  const [blockZones, setBlockZones] = useState<('head' | 'body' | 'waist' | 'legs')[]>([]);
  
  // Находим участника, представляющего игрока
  const playerParticipant = battle?.participants.find((p: BattleParticipantState) => 
    p.type === 'character' && p.entityId === character.id
  );
  
  // Определяем, чей сейчас ход
  const isPlayerTurn = playerParticipant && 
    battle?.participants.find((p: BattleParticipantState) => p.isActive && p.actionPoints > 0)?.id === playerParticipant.id;
  
  useEffect(() => {
    if (socket) {
      // Подписываемся на обновления состояния боя
      socket.on('battle:update', (updatedBattle: BattleState) => {
        dispatch({ type: 'battle/updateBattle', payload: updatedBattle });
      });
      
      // Подписываемся на завершение боя
      socket.on('battle:end', (result: { status: string, rewards: any }) => {
        dispatch({ type: 'battle/endBattle', payload: result });
      });
      
      return () => {
        socket.off('battle:update');
        socket.off('battle:end');
      };
    }
  }, [socket, dispatch]);
  
  const handleTargetSelect = (participantId: number) => {
    if (isPlayerTurn) {
      setSelectedTarget(participantId);
    }
  };
  
  const handleZoneSelect = (zone: 'head' | 'body' | 'waist' | 'legs') => {
    if (isPlayerTurn) {
      setSelectedZone(zone);
    }
  };
  
  const handleBlockZoneToggle = (zone: 'head' | 'body' | 'waist' | 'legs') => {
    if (isPlayerTurn) {
      if (blockZones.includes(zone)) {
        setBlockZones(blockZones.filter(z => z !== zone));
      } else {
        if (blockZones.length < 2) { // Максимум 2 зоны блока
          setBlockZones([...blockZones, zone]);
        }
      }
    }
  };
  
  const handleAttack = () => {
    if (isPlayerTurn && playerParticipant && selectedTarget && selectedZone) {
      const action = {
        type: 'attack',
        targetId: selectedTarget,
        targetZone: selectedZone,
        actionPoints: 2 // Базовая атака обычно стоит 2 ОД
      };
      
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action
      }));
      
      // Сбрасываем выбор после действия
      setSelectedTarget(null);
      setSelectedZone(null);
    }
  };
  
  const handleBlock = () => {
    if (isPlayerTurn && playerParticipant && blockZones.length > 0) {
      const action = {
        type: 'block',
        blockZones,
        actionPoints: 1 // Блок обычно стоит 1 ОД
      };
      
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action
      }));
      
      // Сбрасываем выбор после действия
      setBlockZones([]);
    }
  };
  
  const handleUseSkill = (skillId: number) => {
    if (isPlayerTurn && playerParticipant && selectedTarget) {
      const action = {
        type: 'skill',
        skillId,
        targetId: selectedTarget,
        actionPoints: 3 // Навыки обычно стоят 3 ОД
      };
      
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action
      }));
      
      // Сбрасываем выбор после действия
      setSelectedTarget(null);
    }
  };
  
  const handleUseItem = (itemId: number) => {
    if (isPlayerTurn && playerParticipant) {
      const action = {
        type: 'item',
        itemId,
        targetId: selectedTarget, // Может быть null для самолечения
        actionPoints: 1 // Использование предметов обычно стоит 1 ОД
      };
      
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action
      }));
      
      // Сбрасываем выбор после действия
      setSelectedTarget(null);
    }
  };
  
  const handleFlee = () => {
    if (isPlayerTurn && playerParticipant) {
      const action = {
        type: 'flee',
        actionPoints: 5 // Бегство обычно стоит все ОД
      };
      
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action
      }));
    }
  };
  
  const handleEndTurn = () => {
    if (isPlayerTurn && playerParticipant) {
      // Специальное действие для завершения хода
      dispatch(performAction({
        battleId: battle.id,
        participantId: playerParticipant.id,
        action: { type: 'endTurn', actionPoints: playerParticipant.actionPoints }
      }));
    }
  };
  
  if (!battle) {
    return <div className="battle-loading">Загрузка боя...</div>;
  }
  
  return (
    <div className="battle-container">
      <div className="battle-header">
        <div className="battle-title">
          {battle.type === 'PVE' ? 'Бой с монстрами' : 'PvP бой'}
        </div>
        <div className="battle-status">
          Ход: {battle.turn} | {isPlayerTurn ? 'Ваш ход' : 'Ход противника'}
        </div>
      </div>
      
      <div className="battle-field">
        {/* Зона для отображения боя */}
        <Stage 
          width={800} 
          height={400} 
          options={{ backgroundAlpha: 0 }}
        >
          <Container position={[400, 200]}>
            {/* Здесь рендерим участников боя и эффекты */}
            {battle.participants.map((participant: BattleParticipantState, index: number) => (
              <Container key={participant.id} position={[
                participant.team === 1 ? -200 + (index * 50) : 100 + (index * 50), 
                0
              ]}>
                {/* Спрайт участника боя */}
                <Sprite
                  texture={PIXI.Texture.from(
                    participant.type === 'character' 
                      ? `/assets/sprites/characters/${participant.class}.png` 
                      : `/assets/sprites/monsters/${participant.name.toLowerCase()}.png`
                  )}
                  anchor={0.5}
                  scale={1}
                  interactive={true}
                  cursor={isPlayerTurn && participant.team !== playerParticipant?.team ? 'pointer' : 'default'}
                  pointerdown={() => handleTargetSelect(participant.id)}
                  alpha={participant.isActive ? 1 : 0.5}
                />
                
                {/* Индикаторы здоровья и маны */}
                <Container position={[0, -60]}>
                  <HealthBar 
                    current={participant.health} 
                    max={participant.maxHealth} 
                    width={50} 
                  />
                  {participant.maxMana > 0 && (
                    <ManaBar 
                      current={participant.mana} 
                      max={participant.maxMana} 
                      width={50} 
                      y={10} 
                    />
                  )}
                </Container>
                
                {/* Индикатор очков действий */}
                <ActionPointsIndicator 
                  current={participant.actionPoints} 
                  max={participant.maxActionPoints}
                  position={[0, 50]}
                />
                
                {/* Индикатор выбранной цели */}
                {selectedTarget === participant.id && (
                  <Sprite
                    texture={PIXI.Texture.from('/assets/sprites/ui/target_indicator.png')}
                    anchor={0.5}
                    position={[0, -80]}
                    scale={0.7}
                  />
                )}
                
                {/* Эффекты на участнике */}
                <Container position={[0, -30]}>
                  {participant.effects.map((effect, effectIndex) => (
                    <EffectIcon 
                      key={effect.id}
                      effect={effect}
                      position={[20 * effectIndex, 0]}
                    />
                  ))}
                </Container>
                
                {/* Индикатор стойки */}
                <Sprite
                  texture={PIXI.Texture.from(`/assets/sprites/ui/stance_${participant.stance}.png`)}
                  anchor={0.5}
                  position={[30, -30]}
                  scale={0.5}
                />
              </Container>
            ))}
          </Container>
        </Stage>
        
        {/* Зона цели с выбором зон атаки/блока */}
        {selectedTarget && (
          <div className="target-zone">
            <h3>Выберите зону атаки:</h3>
            <div className="zone-selector">
              <div 
                className={`zone-item ${selectedZone === 'head' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('head')}
              >
                Голова
              </div>
              <div 
                className={`zone-item ${selectedZone === 'body' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('body')}
              >
                Тело
              </div>
              <div 
                className={`zone-item ${selectedZone === 'waist' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('waist')}
              >
                Пояс
              </div>
              <div 
                className={`zone-item ${selectedZone === 'legs' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('legs')}
              >
                Ноги
              </div>
            </div>
          </div>
        )}
        
        {/* Зона блока */}
        {!selectedTarget && (
          <div className="block-zone">
            <h3>Выберите зоны блока (макс. 2):</h3>
            <div className="zone-selector">
              <div 
                className={`zone-item ${blockZones.includes('head') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('head')}
              >
                Голова
              </div>
              <div 
                className={`zone-item ${blockZones.includes('body') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('body')}
              >
                Тело
              </div>
              <div 
                className={`zone-item ${blockZones.includes('waist') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('waist')}
              >
                Пояс
              </div>
              <div 
                className={`zone-item ${blockZones.includes('legs') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('legs')}
              >
                Ноги
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Информация о текущем участнике */}
      {playerParticipant && (
        <div className="player-info">
          <ParticipantInfo participant={playerParticipant} />
        </div>
      )}
      
      {/* Лог боя */}
      <div className="battle-log-container">
        <BattleLog logs={battle.logs} />
      </div>
      
      {/* Элементы управления */}
      {isPlayerTurn && playerParticipant && (
        <BattleControls
          participant={playerParticipant}
          onAttack={handleAttack}
          onBlock={handleBlock}
          onUseSkill={handleUseSkill}
          onUseItem={handleUseItem}
          onFlee={handleFlee}
          onEndTurn={handleEndTurn}
          canAttack={!!selectedTarget && !!selectedZone && playerParticipant.actionPoints >= 2}
          canBlock={blockZones.length > 0 && playerParticipant.actionPoints >= 1}
          selectedTarget={selectedTarget}
        />
      )}
    </div>
  );
};

export default BattleScene;