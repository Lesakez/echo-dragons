            // src/components/game/Battle/BattleScene.tsx
            import React, { useState } from 'react';
            import { useSelector } from 'react-redux';
            import { BattleAction, BattleParticipantState } from '../../../types/battle';
            import BattleControls from './BattleControls';
            import BattleLog from './BattleLog';
            import { Socket } from 'socket.io-client';
            
            interface BattleSceneProps {
              socket: Socket;
              handleAction: (participantId: number, action: BattleAction) => void;
            }
            
            const BattleScene: React.FC<BattleSceneProps> = ({ socket, handleAction }) => {
              const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
              const [selectedZone, setSelectedZone] = useState<'head' | 'body' | 'waist' | 'legs' | null>(null);
              const [blockZones, setBlockZones] = useState<('head' | 'body' | 'waist' | 'legs')[]>([]);
              
              const { current: character } = useSelector((state: any) => state.character);
              const battle = useSelector((state: any) => state.battle.currentBattle);
              
              if (!battle) {
                return <div className="text-center p-8">Загрузка данных боя...</div>;
              }
              
              // Находим участника, представляющего игрока
              const playerParticipant = battle.participants.find((p: BattleParticipantState) => 
                p.type === 'character' && p.entityId === character?.id
              );
              
              // Определяем, чей сейчас ход
              const isPlayerTurn = playerParticipant && 
                battle.participants.find((p: BattleParticipantState) => p.isActive && p.actionPoints > 0)?.id === playerParticipant.id;
              
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
                  const action: BattleAction = {
                    type: 'attack',
                    targetId: selectedTarget,
                    targetZone: selectedZone,
                    actionPoints: 2 // Базовая атака обычно стоит 2 ОД
                  };
                  
                  handleAction(playerParticipant.id, action);
                  
                  // Сбрасываем выбор после действия
                  setSelectedTarget(null);
                  setSelectedZone(null);
                }
              };
              
              const handleBlock = () => {
                if (isPlayerTurn && playerParticipant && blockZones.length > 0) {
                  const action: BattleAction = {
                    type: 'block',
                    blockZones,
                    actionPoints: 1 // Блок обычно стоит 1 ОД
                  };
                  
                  handleAction(playerParticipant.id, action);
                  
                  // Сбрасываем выбор после действия
                  setBlockZones([]);
                }
              };
              
              const handleUseSkill = (skillId: number) => {
                if (isPlayerTurn && playerParticipant && selectedTarget) {
                  const action: BattleAction = {
                    type: 'skill',
                    skillId,
                    targetId: selectedTarget,
                    actionPoints: 3 // Навыки обычно стоят 3 ОД
                  };
                  
                  handleAction(playerParticipant.id, action);
                  
                  // Сбрасываем выбор после действия
                  setSelectedTarget(null);
                }
              };
              
              const handleUseItem = (itemId: number) => {
                if (isPlayerTurn && playerParticipant) {
                  const action: BattleAction = {
                    type: 'item',
                    itemId,
                    targetId: selectedTarget, // Может быть null для самолечения
                    actionPoints: 1 // Использование предметов обычно стоит 1 ОД
                  };
                  
                  handleAction(playerParticipant.id, action);
                  
                  // Сбрасываем выбор после действия
                  setSelectedTarget(null);
                }
              };
              
              const handleFlee = () => {
                if (isPlayerTurn && playerParticipant) {
                  const action: BattleAction = {
                    type: 'flee',
                    actionPoints: 5 // Бегство обычно стоит все ОД
                  };
                  
                  handleAction(playerParticipant.id, action);
                }
              };
              
              const handleEndTurn = () => {
                if (isPlayerTurn && playerParticipant) {
                  // Специальное действие для завершения хода
                  const action: BattleAction = { 
                    type: 'endTurn', 
                    actionPoints: playerParticipant.actionPoints 
                  };
                  
                  handleAction(playerParticipant.id, action);
                }
              };
              
              // Функция для преобразования названия зоны в человекочитаемый формат
              const getZoneName = (zone: string): string => {
                switch (zone) {
                  case 'head': return 'Голова';
                  case 'body': return 'Тело';
                  case 'waist': return 'Пояс';
                  case 'legs': return 'Ноги';
                  default: return zone;
                }
              };
              
              return (
                <div className="max-w-6xl mx-auto bg-surface rounded-lg p-6 shadow-card">
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-xl font-display text-primary">
                      {battle.type === 'PVE' ? 'Бой с монстрами' : 'PvP бой'}
                    </div>
                    <div>
                      Ход: {battle.turn} | {isPlayerTurn ? 'Ваш ход' : 'Ход противника'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Левая боковая панель - информация о персонаже */}
                    <div className="lg:col-span-1">
                      {playerParticipant && (
                        <div className="bg-background p-4 rounded-lg">
                          <h3 className="text-lg font-bold text-primary mb-2">{playerParticipant.name}</h3>
                          
                          <div className="space-y-2 mb-4">
                            <div>
                              <div className="text-text-secondary text-sm">Здоровье</div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                  className="bg-green-500 h-3 rounded-full transition-all" 
                                  style={{ width: `${(playerParticipant.health / playerParticipant.maxHealth) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-right text-sm">{playerParticipant.health}/{playerParticipant.maxHealth}</div>
                            </div>
                            
                            <div>
                              <div className="text-text-secondary text-sm">Мана</div>
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                  className="bg-blue-500 h-3 rounded-full transition-all" 
                                  style={{ width: `${(playerParticipant.mana / playerParticipant.maxMana) * 100}%` }}
                                ></div>
                              </div>
                              <div className="text-right text-sm">{playerParticipant.mana}/{playerParticipant.maxMana}</div>
                            </div>
                            
                            <div>
                              <div className="text-text-secondary text-sm">Очки действий</div>
                              <div className="flex space-x-1 mt-1">
                                {Array.from({ length: playerParticipant.maxActionPoints }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className={`w-4 h-4 rounded-full ${i < playerParticipant.actionPoints ? 'bg-primary' : 'bg-gray-700'}`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Эффекты */}
                          {playerParticipant.effects.length > 0 && (
                            <div>
                              <div className="text-text-secondary text-sm mb-1">Активные эффекты</div>
                              <div className="space-y-1">
                                {playerParticipant.effects.map(effect => (
                                  <div key={effect.id} className="flex justify-between text-sm">
                                    <span className={effect.type === 'buff' ? 'text-green-400' : 'text-red-400'}>
                                      {effect.name}
                                    </span>
                                    <span>{effect.remainingTurns} ход.</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Секция выбора зоны атаки/блока */}
                      {isPlayerTurn && (
                        <div className="bg-background p-4 rounded-lg mt-4">
                          {selectedTarget ? (
                            <>
                              <h3 className="text-lg font-bold text-primary mb-2">Выберите зону атаки:</h3>
                              <div className="grid grid-cols-2 gap-2">
                                {['head', 'body', 'waist', 'legs'].map((zone) => (
                                  <div 
                                    key={zone}
                                    className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
                                      selectedZone === zone
                                        ? 'border-primary bg-primary/20 text-primary'
                                        : 'border-gray-700 hover:border-primary/50'
                                    }`}
                                    onClick={() => handleZoneSelect(zone as any)}
                                  >
                                    {getZoneName(zone)}
                                  </div>
                                ))}
                              </div>
                              
                              {selectedZone && (
                                <button
                                  className="w-full mt-3 py-2 bg-primary text-background font-bold rounded hover:bg-primary/90 transition-colors"
                                  onClick={handleAttack}
                                >
                                  Атаковать
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <h3 className="text-lg font-bold text-primary mb-2">Выберите зоны блока (макс. 2):</h3>
                              <div className="grid grid-cols-2 gap-2">
                                {['head', 'body', 'waist', 'legs'].map((zone) => (
                                  <div 
                                    key={zone}
                                    className={`p-2 border rounded-md cursor-pointer text-center transition-colors ${
                                      blockZones.includes(zone as any)
                                        ? 'border-primary bg-primary/20 text-primary'
                                        : 'border-gray-700 hover:border-primary/50'
                                    }`}
                                    onClick={() => handleBlockZoneToggle(zone as any)}
                                  >
                                    {getZoneName(zone)}
                                  </div>
                                ))}
                              </div>
                              
                              {blockZones.length > 0 && (
                                <button
                                  className="w-full mt-3 py-2 bg-secondary text-white font-bold rounded hover:bg-secondary/90 transition-colors"
                                  onClick={handleBlock}
                                >
                                  Блокировать
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Центральная область - поле боя */}
                    <div className="lg:col-span-2">
                      <div className="bg-background p-4 rounded-lg mb-4 min-h-96 flex flex-col items-center justify-center">
                        <div className="w-full flex justify-center mb-6">
                          <div className="text-center">
                            <div className="mb-2 text-lg font-bold text-primary">Ваша команда</div>
                            <div className="flex flex-wrap justify-center gap-4">
                              {battle.participants
                                .filter((p: BattleParticipantState) => p.team === 1)
                                .map((participant: BattleParticipantState) => (
                                  <div 
                                    key={participant.id}
                                    className={`p-4 border rounded-lg text-center ${
                                      participant.isActive 
                                        ? 'border-green-500' 
                                        : 'border-red-500 opacity-50'
                                    }`}
                                  >
                                    <div className="text-lg font-bold">{participant.name}</div>
                                    <div className="mt-2">
                                      <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full" 
                                          style={{ width: `${(participant.health / participant.maxHealth) * 100}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs mt-1">{participant.health}/{participant.maxHealth}</div>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="my-4 border-t border-gray-700 w-3/4"></div>
                        
                        <div className="w-full flex justify-center">
                          <div className="text-center">
                            <div className="mb-2 text-lg font-bold text-accent">Вражеская команда</div>
                            <div className="flex flex-wrap justify-center gap-4">
                              {battle.participants
                                .filter((p: BattleParticipantState) => p.team === 2)
                                .map((participant: BattleParticipantState) => (
                                  <div 
                                    key={participant.id}
                                    className={`p-4 border rounded-lg text-center cursor-pointer ${
                                      !participant.isActive 
                                        ? 'border-red-500 opacity-50' 
                                        : isPlayerTurn && selectedTarget === participant.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-red-500 hover:border-primary'
                                    }`}
                                    onClick={() => participant.isActive && handleTargetSelect(participant.id)}
                                  >
                                    <div className="text-lg font-bold">{participant.name}</div>
                                    <div className="mt-2">
                                      <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-red-500 h-2 rounded-full" 
                                          style={{ width: `${(participant.health / participant.maxHealth) * 100}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs mt-1">{participant.health}/{participant.maxHealth}</div>
                                    </div>
                                    
                                    {participant.effects.length > 0 && (
                                      <div className="mt-2 flex justify-center gap-1">
                                        {participant.effects.map(effect => (
                                          <div 
                                            key={effect.id}
                                            className={`w-3 h-3 rounded-full ${effect.type === 'buff' ? 'bg-green-500' : 'bg-red-500'}`}
                                            title={`${effect.name} (${effect.remainingTurns} ход.)`}
                                          ></div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Элементы управления */}
                      {isPlayerTurn && playerParticipant && (
                        <div className="bg-background p-4 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => setSelectedTarget(null)}
                              disabled={!selectedTarget}
                            >
                              Отменить выбор
                            </button>
                            
                            <button
                              className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition-colors"
                              onClick={handleFlee}
                            >
                              Бегство (5 ОД)
                            </button>
                            
                            <button
                              className="px-4 py-2 bg-gray-600 text-white font-bold rounded hover:bg-gray-700 transition-colors ml-auto"
                              onClick={handleEndTurn}
                            >
                              Завершить ход
                            </button>
                          </div>
                          
                          {/* Здесь могут быть кнопки для использования навыков и предметов */}
                        </div>
                      )}
                    </div>
                    
                    {/* Правая боковая панель - лог боя */}
                    <div className="lg:col-span-1">
                      <div className="bg-background p-4 rounded-lg h-full max-h-96 overflow-y-auto">
                        <h3 className="text-lg font-bold text-primary mb-2 sticky top-0 bg-background">Журнал боя</h3>
                        <div className="space-y-2">
                          {battle.logs.map((log: string, index: number) => (
                            <div 
                              key={index} 
                              className={`p-2 rounded text-sm ${
                                log.includes('побежден') 
                                  ? 'bg-red-900/30 text-red-400' 
                                  : log.includes('Ход') 
                                  ? 'bg-blue-900/30 text-blue-400 font-bold' 
                                  : 'text-text-primary'
                              }`}
                            >
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            };
            
            export default BattleScene;