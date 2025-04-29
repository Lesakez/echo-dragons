// src/models/npc.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('npcs')
export class Npc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, nullable: true })
  faction: string;

  @Column({ default: false, name: 'is_merchant' })
  isMerchant: boolean;

  @Column({ default: false, name: 'is_quest_giver' })
  isQuestGiver: boolean;

  @Column({ default: false, name: 'is_trainer' })
  isTrainer: boolean;

  @Column({ type: 'float', name: 'x_position' })
  xPosition: number;

  @Column({ type: 'float', name: 'y_position' })
  yPosition: number;

  @Column({ name: 'map_id', length: 50 })
  mapId: string;

  @Column({ type: 'jsonb', nullable: true })
  dialogue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'available_quests' })
  availableQuests: number[];

  @Column({ type: 'jsonb', nullable: true })
  inventory: Record<string, any>;
}