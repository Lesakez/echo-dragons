import axios from 'axios';
import { BattleState, BattleAction, BattleType, BattleStatus } from '../types/battle';
import { API_URL } from '../config';
import socket from './socketService';

class BattleService {
  /**
   * Начать PvE бой с монстрами
   */
  async startPvEBattle(characterId: number, monsterIds: number[]): Promise<BattleState> {
    try {
      const response = await axios.post(`${API_URL}/battles/pve`, {
        characterId,
        monsterIds,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось начать бой');
      }
      throw new Error('Ошибка сети при попытке начать бой');
    }
  }

  /**
   * Начать PvP бой с другими игроками
   */
  async startPvPBattle(characterIds: number[]): Promise<BattleState> {
    try {
      const response = await axios.post(`${API_URL}/battles/pvp`, {
        characterIds,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось начать PvP бой');
      }
      throw new Error('Ошибка сети при попытке начать PvP бой');
    }
  }

  /**
   * Выполнить действие в бою
   */
  async performAction(
    battleId: number,
    participantId: number,
    action: BattleAction
  ): Promise<BattleState> {
    try {
      const response = await axios.post(`${API_URL}/battles/${battleId}/action`, {
        participantId,
        action,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось выполнить действие');
      }
      throw new Error('Ошибка сети при попытке выполнить действие');
    }
  }

  /**
   * Получить текущее состояние боя
   */
  async getBattleState(battleId: number): Promise<BattleState> {
    try {
      const response = await axios.get(`${API_URL}/battles/${battleId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось получить состояние боя');
      }
      throw new Error('Ошибка сети при попытке получить состояние боя');
    }
  }

  /**
   * Получить историю боев персонажа
   */
  async getBattleHistory(characterId: number): Promise<{
    id: number;
    type: BattleType;
    result: string;
    date: Date;
  }[]> {
    try {
      const response = await axios.get(`${API_URL}/characters/${characterId}/battles`);
      return response.data.map((battle: any) => {
        // Проверяем, что type соответствует BattleType
        const validTypes = [BattleType.PVE, BattleType.PVP, BattleType.GUILD];
        const battleType = validTypes.includes(battle.type)
          ? battle.type as BattleType
          : BattleType.PVE; // Значение по умолчанию, если type некорректен
        return {
          id: battle.id,
          type: battleType,
          result: battle.result,
          date: new Date(battle.date),
        };
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось получить историю боев');
      }
      throw new Error('Ошибка сети при попытке получить историю боев');
    }
  }

  /**
   * Получить детали прошедшего боя
   */
  async getBattleDetails(battleId: number): Promise<{
    battleState: BattleState;
    logs: string[];
    result: {
      status: BattleStatus;
      duration: number;
      rewards?: any;
    };
  }> {
    try {
      const response = await axios.get(`${API_URL}/battles/${battleId}/details`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Не удалось получить детали боя');
      }
      throw new Error('Ошибка сети при попытке получить детали боя');
    }
  }

  /**
   * Подключиться к боевой сессии через WebSocket
   */
  connectToBattle(battleId: number, characterId: number, onUpdate: (battle: BattleState) => void): () => void {
    socket.emit('battle:join', { battleId, characterId });
    const handleBattleUpdate = (updatedBattle: BattleState) => {
      onUpdate(updatedBattle);
    };
    socket.on('battle:update', handleBattleUpdate);
    return () => {
      socket.off('battle:update', handleBattleUpdate);
      socket.emit('battle:leave', { battleId, characterId });
    };
  }

  /**
   * Начать тестовый бой для отладки
   */
  startTestBattle(): BattleState {
    const testBattle: BattleState = {
      id: Date.now(),
      type: BattleType.PVE,
      status: BattleStatus.ACTIVE,
      turn: 1,
      participants: [
        {
          id: 1,
          type: 'character',
          entityId: 1,
          name: 'Тестовый персонаж',
          class: 'warrior',
          health: 100,
          maxHealth: 100,
          mana: 50,
          maxMana: 50,
          initiative: 15,
          actionPoints: 5,
          maxActionPoints: 5,
          team: 1,
          effects: [],
          isActive: true,
          stance: 'balanced',
        },
        {
          id: 2,
          type: 'monster',
          entityId: 101,
          name: 'Тестовый гоблин',
          health: 60,
          maxHealth: 60,
          mana: 20,
          maxMana: 20,
          initiative: 10,
          actionPoints: 4,
          maxActionPoints: 4,
          team: 2,
          effects: [],
          isActive: true,
          stance: 'offensive',
        },
      ],
      logs: ['Бой начался!'],
      startTime: new Date(),
      lastActionTime: new Date(),
    };
    return testBattle;
  }

  /**
   * Симуляция действия в тестовом бою
   */
  performTestAction(battle: BattleState, participantId: number, action: BattleAction): BattleState {
    const updatedBattle = JSON.parse(JSON.stringify(battle)) as BattleState;
    const participant = updatedBattle.participants.find((p) => p.id === participantId);
    if (!participant) {
      throw new Error('Участник не найден');
    }
    if (participant.actionPoints < action.actionPoints) {
      throw new Error('Недостаточно очков действий');
    }
    switch (action.type) {
      case 'attack':
        if (!action.targetId || !action.targetZone) {
          throw new Error('Не указана цель или зона атаки');
        }
        const target = updatedBattle.participants.find((p) => p.id === action.targetId);
        if (!target) {
          throw new Error('Цель не найдена');
        }
        const damage = Math.floor(Math.random() * 10) + 5;
        target.health = Math.max(0, target.health - damage);
        updatedBattle.logs.push(
          `${participant.name} атакует ${target.name} в ${this.getZoneName(action.targetZone)} и наносит ${damage} урона.`
        );
        participant.actionPoints -= action.actionPoints;
        if (target.health <= 0) {
          target.isActive = false;
          updatedBattle.logs.push(`${target.name} побежден!`);
        }
        break;
      case 'block':
        if (!action.blockZones || action.blockZones.length === 0) {
          throw new Error('Не указаны зоны блока');
        }
        updatedBattle.logs.push(
          `${participant.name} готовится блокировать ${action.blockZones.map((zone) => this.getZoneName(zone)).join(' и ')}.`
        );
        participant.actionPoints -= action.actionPoints;
        break;
      case 'flee':
        const fleeChance = Math.random() < 0.7;
        if (fleeChance) {
          participant.isActive = false;
          updatedBattle.logs.push(`${participant.name} успешно сбегает с поля боя!`);
        } else {
          updatedBattle.logs.push(`${participant.name} пытается сбежать, но не удаётся!`);
        }
        participant.actionPoints = 0;
        break;
      case 'endTurn':
        updatedBattle.logs.push(`${participant.name} завершает свой ход.`);
        participant.actionPoints = 0;
        break;
      default:
        throw new Error(`Неизвестный тип действия: ${action.type}`);
    }
    const allDone = updatedBattle.participants.every((p) => !p.isActive || p.actionPoints <= 0);
    if (allDone) {
      this.startNewTestTurn(updatedBattle);
    }
    this.checkTestBattleEnd(updatedBattle);
    return updatedBattle;
  }

  private startNewTestTurn(battle: BattleState): void {
    battle.turn += 1;
    battle.logs.push(`--- Ход ${battle.turn} ---`);
    battle.participants.forEach((p) => {
      if (p.isActive) {
        p.actionPoints = p.maxActionPoints;
      }
    });
    battle.participants.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return b.initiative - a.initiative;
    });
  }

  private checkTestBattleEnd(battle: BattleState): void {
    const team1Active = battle.participants.some((p) => p.isActive && p.team === 1);
    const team2Active = battle.participants.some((p) => p.isActive && p.team === 2);
    if (!team1Active) {
      battle.status = BattleStatus.DEFEAT;
      battle.logs.push('Бой завершается поражением!');
    } else if (!team2Active) {
      battle.status = BattleStatus.VICTORY;
      battle.logs.push('Бой завершается победой!');
    }
  }

  private getZoneName(zone: 'head' | 'body' | 'waist' | 'legs'): string {
    switch (zone) {
      case 'head':
        return 'голову';
      case 'body':
        return 'тело';
      case 'waist':
        return 'пояс';
      case 'legs':
        return 'ноги';
    }
  }
}

export default new BattleService();