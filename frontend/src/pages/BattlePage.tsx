// frontend/src/pages/BattlePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { startPvEBattle, performAction, updateBattle, endBattle, resetBattleState } from '../store/slices/battleSlice';
import BattleScene from '../components/game/Battle/BattleScene';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BattleState, BattleStatus, BattleAction } from '../types/battle';
import { useAppDispatch, useAppSelector } from '../types/redux';

const BattlePage: React.FC = () => {
  const { battleId } = useParams<{battleId?: string}>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Use typed selector hooks
  const { user } = useAppSelector(state => state.auth);
  const { current: character } = useAppSelector(state => state.character);
  const { currentBattle, loading, error, battleResult } = useAppSelector(state => state.battle);
  
  // Handle socket events
  const setupSocketEvents = useCallback(() => {
    // Battle update event
    const battleUpdateHandler = (updatedBattle: BattleState) => {
      dispatch(updateBattle(updatedBattle));
    };
    
    // Battle end event
    const battleEndHandler = (result: any) => {
      dispatch(endBattle(result));
    };
    
    // Socket connection error
    const connectionErrorHandler = (error: any) => {
      console.error('Socket connection error:', error);
      setConnectionError('Failed to connect to battle server. Please try again later.');
    };
    
    // Register event handlers
    socketService.on('battle:update', battleUpdateHandler);
    socketService.on('battle:end', battleEndHandler);
    socketService.on('connect_error', connectionErrorHandler);
    
    // Return cleanup function
    return () => {
      socketService.off('battle:update', battleUpdateHandler);
      socketService.off('battle:end', battleEndHandler);
      socketService.off('connect_error', connectionErrorHandler);
    };
  }, [dispatch]);
  
  // Connect to server and initialize battle
  useEffect(() => {
    // Reset battle state when unmounting or when component first loads
    dispatch(resetBattleState());
    
    if (!character) {
      navigate('/character/select');
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    
    // Connect to socket if not already connected
    if (!socketService.getSocket().connected) {
      socketService.connect();
    }
    
    // Set up socket event handlers
    const cleanupSocketEvents = setupSocketEvents();
    
    // Initialize or join battle
    const initBattle = async () => {
      try {
        if (battleId) {
          // Join existing battle
          socketService.emit('battle:join', { 
            battleId: parseInt(battleId), 
            characterId: character.id 
          });
        } else {
          // Start a new PvE battle with default monsters
          await dispatch(startPvEBattle({ 
            characterId: character.id, 
            // Default to fighting goblins - IDs from DB
            monsterIds: [1, 2]
          }));
        }
        setIsConnecting(false);
      } catch (err) {
        console.error('Battle initialization error:', err);
        setConnectionError('Failed to initialize battle. Please try again later.');
        setIsConnecting(false);
      }
    };
    
    initBattle();
    
    // Cleanup on unmount
    return () => {
      cleanupSocketEvents();
      
      if (currentBattle) {
        socketService.emit('battle:leave', { 
          battleId: currentBattle.id, 
          characterId: character.id 
        });
      }
    };
  }, [character, battleId, dispatch, navigate, currentBattle, setupSocketEvents]);
  
  // Handle player actions
  const handleAction = useCallback((participantId: number, action: BattleAction) => {
    if (!currentBattle) return;
    
    dispatch(performAction({
      battleId: currentBattle.id,
      participantId,
      action
    }));
    
    // Also emit the action via socket for real-time updates
    socketService.emit('battle:action', {
      battleId: currentBattle.id,
      participantId,
      action
    });
  }, [currentBattle, dispatch]);
  
  // Redirect to home after battle ends
  useEffect(() => {
    if (battleResult) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [battleResult, navigate]);
  
  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-xl mb-4">You need to select a character to participate in battles</p>
        <button
          onClick={() => navigate('/character/select')}
          className="px-4 py-2 bg-primary text-background font-bold rounded hover:bg-primary/90 transition-colors"
        >
          Select Character
        </button>
      </div>
    );
  }
  
  if (isConnecting || loading) {
    return <LoadingSpinner />;
  }
  
  if (connectionError || error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="p-4 mb-6 bg-accent/20 border border-accent rounded-md text-accent max-w-xl w-full text-center">
          {connectionError || error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-secondary text-white font-bold rounded hover:bg-secondary/80 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  if (!currentBattle) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-xl mb-4">Initializing battle...</p>
        <LoadingSpinner />
      </div>
    );
  }
  
  // Show battle results if battle is over
  if (battleResult) {
    const isVictory = battleResult.status === BattleStatus.VICTORY;
    
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className={`text-3xl font-display mb-6 ${isVictory ? 'text-green-500' : 'text-accent'}`}>
          {isVictory ? 'Victory!' : 'Defeat!'}
        </h2>
        
        {battleResult.rewards && (
          <div className="bg-surface rounded-lg p-6 mb-6 max-w-xl w-full">
            <h3 className="text-xl text-primary mb-4">Rewards:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-text-secondary">Experience:</p>
                <p className="text-xl">{battleResult.rewards.experience}</p>
              </div>
              <div>
                <p className="text-text-secondary">Gold:</p>
                <p className="text-xl">{battleResult.rewards.gold}</p>
              </div>
            </div>
            
            {battleResult.rewards.items && battleResult.rewards.items.length > 0 && (
              <div className="mt-4">
                <p className="text-text-secondary mb-2">Items:</p>
                <ul className="space-y-1">
                  {battleResult.rewards.items.map((item: any, index: number) => (
                    <li key={index} className="flex items-center">
                      <span className="text-primary">{item.name}</span>
                      <span className="ml-auto text-text-secondary">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <p className="text-text-secondary mb-6">Redirecting to home in a few seconds...</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-background font-bold rounded hover:bg-primary/90 transition-colors"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  // Show battle interface
  return (
    <div className="p-4">
      <BattleScene
        socket={socketService.getSocket()}
        handleAction={handleAction}
      />
    </div>
  );
};

export default BattlePage;