// src/models/battlefield.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('battlefields')
export class Battlefield {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 1, name: 'min_level' })
  minLevel: number;

  @Column({ default: 100, name: 'max_level' })
  maxLevel: number;

  @Column({ default: 5, name: 'min_players_per_team' })
  minPlayersPerTeam: number;

  @Column({ default: 10, name: 'max_players_per_team' })
  maxPlayersPerTeam: number;

  @Column({ type: 'jsonb', nullable: true, name: 'win_conditions' })
  winConditions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  rewards: Record<string, any>;

  @Column({ name: 'map_id', length: 50 })
  mapId: string;
}