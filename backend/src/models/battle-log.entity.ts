// src/models/battle-log.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { BattleType, BattleStatus, BattleParticipant } from './battle.entity';

@Entity('battle_logs')
export class BattleLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'battle_id' })
  battleId: string;

  @Column({
    type: 'enum',
    enum: BattleType,
    name: 'battle_type',
  })
  battleType: BattleType;

  @Column({
    type: 'enum',
    enum: BattleStatus,
    name: 'result',
  })
  result: BattleStatus;

  @Column({ type: 'jsonb', name: 'participants' })
  participants: BattleParticipant[];

  @Column({ type: 'jsonb', name: 'log', default: [] })
  log: string[];

  @Column({ type: 'integer', name: 'duration' })
  duration: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}