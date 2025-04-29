// src/models/battle.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

export enum BattleType {
  PVE = 'pve',
  PVP = 'pvp',
  GUILD = 'guild',
}

export enum BattleStatus {
  ACTIVE = 'active',
  VICTORY = 'victory',
  DEFEAT = 'defeat',
  DRAW = 'draw',
}

export interface BattleParticipant {
  id: number;
  type: 'character' | 'monster';
  entityId: number;
  name: string;
  team: number;
}

@Entity('battles')
export class Battle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BattleType,
    name: 'battle_type',
  })
  type: BattleType;

  @Column({
    type: 'enum',
    enum: BattleStatus,
    name: 'status',
    default: BattleStatus.ACTIVE,
  })
  status: BattleStatus;

  @Column({ default: 1 })
  turn: number;

  @Column({ type: 'jsonb', name: 'participants' })
  participants: BattleParticipant[];

  @Column({ type: 'jsonb', name: 'logs', default: [] })
  logs: string[];

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'last_action_time', nullable: true })
  lastActionTime: Date;

  @Column({ type: 'timestamp with time zone', name: 'ended_at', nullable: true })
  endedAt: Date;
}