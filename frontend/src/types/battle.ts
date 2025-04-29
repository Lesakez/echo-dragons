// frontend/src/types/battle.ts
/**
 * Types for the battle system
 */

export enum BattleType {
  PVE = 'pve',
  PVP = 'pvp',
  GUILD = 'guild'
}

export enum BattleStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  DRAW = 'draw'
}

export type BattleStance = 'offensive' | 'defensive' | 'balanced';

export interface BattleEffect {
  id: number;
  name: string;
  type: 'buff' | 'debuff';
  affectedStats: {
    [key: string]: number;
  };
  remainingTurns: number;
  sourceId: number;
}

export interface BattleParticipantState {
  id: number;
  type: 'character' | 'monster';
  entityId: number;
  name: string;
  class?: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  initiative: number;
  actionPoints: number;
  maxActionPoints: number;
  team: number;
  effects: BattleEffect[];
  isActive: boolean;
  lastAction?: BattleAction;
  stance: BattleStance;
}

export interface BattleAction {
  type: 'attack' | 'block' | 'skill' | 'item' | 'flee' | 'endTurn';
  targetId?: number;
  targetZone?: 'head' | 'body' | 'waist' | 'legs';
  blockZones?: ('head' | 'body' | 'waist' | 'legs')[];
  itemId?: number;
  skillId?: number;
  actionPoints: number;
}

export interface BattleState {
  id: number;
  type: BattleType;
  status: BattleStatus;
  turn: number;
  participants: BattleParticipantState[];
  logs: string[];
  startTime: Date;
  lastActionTime: Date;
}

export interface BattleRewards {
  experience: number;
  gold: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    quality?: string;
  }[];
  reputation?: {
    faction: string;
    amount: number;
  }[];
}

export interface BattleResult {
  status: BattleStatus;
  duration: number; // in seconds
  rewards?: BattleRewards;
}