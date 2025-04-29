import { BattleType, BattleStatus, BattleParticipant } from '../../models/battle.entity';
import { Skill } from '../../models/skill.entity';

// Интерфейсы для действий в бою
export interface BattleAction {
  type: 'attack' | 'skill' | 'item' | 'block' | 'flee';
  targetId?: number;
  targetZone?: 'head' | 'body' | 'waist' | 'legs';
  blockZones?: ('head' | 'body' | 'waist' | 'legs')[];
  itemId?: number;
  skillId?: number;
  actionPoints: number;
}

// Состояние боя
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

// Состояние участника боя
export interface BattleParticipantState {
  id: number;
  type: 'character' | 'monster';
  entityId: number;
  name: string;
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
  stance: 'offensive' | 'defensive' | 'balanced';
}

// Эффект в бою
export interface BattleEffect {
  id: number;
  name: string;
  type: 'buff' | 'debuff';
  affectedStats: { [key: string]: number };
  remainingTurns: number;
  sourceId: number;
}

// Расширенный интерфейс для умений
export interface SkillComplete extends Skill {
  manaCost: number;
  targetType: 'self' | 'single' | 'aoe';
  targetTeam: 'enemy' | 'ally' | 'all';
  effectType: 'damage' | 'heal' | 'buff' | 'debuff' | 'aoe_damage';
  duration?: number;
  statModifiers?: Record<string, number>;
  additionalEffects?: {
    name: string;
    type: 'buff' | 'debuff';
    statModifiers: Record<string, number>;
    duration: number;
    chance: number;
  }[];
  damageType?: 'physical' | 'magical';
  baseHealing: number; // Сделано обязательным для соответствия Skill
}