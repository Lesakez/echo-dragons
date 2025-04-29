// frontend/src/components/game/Battle/BattleScene.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Container, Sprite } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { Socket } from 'socket.io-client';
import { BattleState, BattleParticipantState, BattleAction } from '../../../types/battle';
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
  handleAction: (participantId: number, action: BattleAction) => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({ socket, handleAction }) => {
  const dispatch = useDispatch();
  const battle = useSelector((state: any) => state.battle.currentBattle);
  const character = useSelector((state: any) => state.character.current);
  
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [selectedZone, setSelectedZone] = useState<'head' | 'body' | 'waist' | 'legs' | null>(null);
  const [blockZones, setBlockZones] = useState<('head' | 'body' | 'waist' | 'legs')[]>([]);
  
  // Find participant representing the player
  const playerParticipant = battle?.participants.find((p: BattleParticipantState) => 
    p.type === 'character' && p.entityId === character?.id
  );
  
  // Determine whose turn it is
  const isPlayerTurn = playerParticipant && 
    battle?.participants.find((p: BattleParticipantState) => p.isActive && p.actionPoints > 0)?.id === playerParticipant.id;
  
  useEffect(() => {
    if (socket) {
      // Subscribe to battle state updates
      socket.on('battle:update', (updatedBattle: BattleState) => {
        dispatch({ type: 'battle/updateBattle', payload: updatedBattle });
      });
      
      // Subscribe to battle end event
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
        if (blockZones.length < 2) { // Maximum 2 block zones
          setBlockZones([...blockZones, zone]);
        }
      }
    }
  };
  
  const handleAttack = () => {
    if (isPlayerTurn && playerParticipant && selectedTarget && selectedZone) {
      const action: BattleAction = {
        type: 'attack',
        targetId: selectedTarget,
        targetZone: selectedZone,
        actionPoints: 2 // Basic attack usually costs 2 AP
      };
      
      handleAction(playerParticipant.id, action);
      
      // Reset selection after action
      setSelectedTarget(null);
      setSelectedZone(null);
    }
  };
  
  const handleBlock = () => {
    if (isPlayerTurn && playerParticipant && blockZones.length > 0) {
      const action: BattleAction = {
        type: 'block',
        blockZones,
        actionPoints: 1 // Block usually costs 1 AP
      };
      
      handleAction(playerParticipant.id, action);
      
      // Reset selection after action
      setBlockZones([]);
    }
  };
  
  const handleUseSkill = (skillId: number) => {
    if (isPlayerTurn && playerParticipant && selectedTarget) {
      const action: BattleAction = {
        type: 'skill',
        skillId,
        targetId: selectedTarget,
        actionPoints: 3 // Skills usually cost 3 AP
      };
      
      handleAction(playerParticipant.id, action);
      
      // Reset selection after action
      setSelectedTarget(null);
    }
  };
  
  const handleUseItem = (itemId: number) => {
    if (isPlayerTurn && playerParticipant) {
      const action: BattleAction = {
        type: 'item',
        itemId,
        // Convert null to undefined to match the BattleAction type
        targetId: selectedTarget === null ? undefined : selectedTarget,
        actionPoints: 1 // Using items usually costs 1 AP
      };
      
      handleAction(playerParticipant.id, action);
      
      // Reset selection after action
      setSelectedTarget(null);
    }
  };
  
  const handleFlee = () => {
    if (isPlayerTurn && playerParticipant) {
      const action: BattleAction = {
        type: 'flee',
        actionPoints: 5 // Fleeing usually costs all AP
      };
      
      handleAction(playerParticipant.id, action);
    }
  };
  
  const handleEndTurn = () => {
    if (isPlayerTurn && playerParticipant) {
      // Special action to end turn
      const action: BattleAction = { 
        type: 'endTurn', 
        actionPoints: playerParticipant.actionPoints 
      };
      
      handleAction(playerParticipant.id, action);
    }
  };
  
  if (!battle) {
    return <div className="battle-loading">Loading battle...</div>;
  }
  
  return (
    <div className="battle-container">
      <div className="battle-header">
        <div className="battle-title">
          {battle.type === 'pve' ? 'Monster Battle' : 'PvP Battle'}
        </div>
        <div className="battle-status">
          Turn: {battle.turn} | {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
        </div>
      </div>
      
      <div className="battle-field">
        {/* Battle rendering area */}
        <Stage 
          width={800} 
          height={400} 
          options={{ backgroundAlpha: 0 }}
        >
          <Container position={[400, 200]}>
            {/* Render battle participants and effects */}
            {battle.participants.map((participant: BattleParticipantState, index: number) => (
              <Container key={participant.id} position={[
                participant.team === 1 ? -200 + (index * 50) : 100 + (index * 50), 
                0
              ]}>
                {/* Participant sprite */}
                <Sprite
                  texture={PIXI.Texture.from(
                    participant.type === 'character' 
                      ? `/assets/sprites/characters/${participant.class || 'default'}.png` 
                      : `/assets/sprites/monsters/${participant.name.toLowerCase()}.png`
                  )}
                  anchor={0.5}
                  scale={1}
                  interactive={true}
                  cursor={isPlayerTurn && participant.team !== playerParticipant?.team ? 'pointer' : 'default'}
                  pointerdown={() => handleTargetSelect(participant.id)}
                  alpha={participant.isActive ? 1 : 0.5}
                />
                
                {/* Health and mana indicators */}
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
                
                {/* Action points indicator */}
                <ActionPointsIndicator 
                  current={participant.actionPoints} 
                  max={participant.maxActionPoints}
                  position={[0, 50]}
                />
                
                {/* Target indicator */}
                {selectedTarget === participant.id && (
                  <Sprite
                    texture={PIXI.Texture.from('/assets/sprites/ui/target_indicator.png')}
                    anchor={0.5}
                    position={[0, -80]}
                    scale={0.7}
                  />
                )}
                
                {/* Participant effects */}
                <Container position={[0, -30]}>
                  {participant.effects.map((effect, effectIndex) => (
                    <EffectIcon 
                      key={effect.id}
                      effect={effect}
                      position={[20 * effectIndex, 0]}
                    />
                  ))}
                </Container>
                
                {/* Stance indicator */}
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
        
        {/* Target zone with attack zone selection */}
        {selectedTarget && (
          <div className="target-zone">
            <h3>Select attack zone:</h3>
            <div className="zone-selector">
              <div 
                className={`zone-item ${selectedZone === 'head' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('head')}
              >
                Head
              </div>
              <div 
                className={`zone-item ${selectedZone === 'body' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('body')}
              >
                Body
              </div>
              <div 
                className={`zone-item ${selectedZone === 'waist' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('waist')}
              >
                Waist
              </div>
              <div 
                className={`zone-item ${selectedZone === 'legs' ? 'selected' : ''}`}
                onClick={() => handleZoneSelect('legs')}
              >
                Legs
              </div>
            </div>
          </div>
        )}
        
        {/* Block zone */}
        {!selectedTarget && (
          <div className="block-zone">
            <h3>Select block zones (max. 2):</h3>
            <div className="zone-selector">
              <div 
                className={`zone-item ${blockZones.includes('head') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('head')}
              >
                Head
              </div>
              <div 
                className={`zone-item ${blockZones.includes('body') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('body')}
              >
                Body
              </div>
              <div 
                className={`zone-item ${blockZones.includes('waist') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('waist')}
              >
                Waist
              </div>
              <div 
                className={`zone-item ${blockZones.includes('legs') ? 'selected' : ''}`}
                onClick={() => handleBlockZoneToggle('legs')}
              >
                Legs
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Current participant info */}
      {playerParticipant && (
        <div className="player-info">
          <ParticipantInfo participant={playerParticipant} />
        </div>
      )}
      
      {/* Battle log */}
      <div className="battle-log-container">
        <BattleLog logs={battle.logs} />
      </div>
      
      {/* Controls */}
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