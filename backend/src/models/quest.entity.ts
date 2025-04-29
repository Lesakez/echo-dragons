// src/models/quest.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quests')
export class Quest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, nullable: true })
  faction: string;

  @Column({ default: 1, name: 'min_level' })
  minLevel: number;

  @Column({ default: 100, name: 'max_level' })
  maxLevel: number;

  @Column({ default: false, name: 'is_repeatable' })
  isRepeatable: boolean;

  @Column({ default: false, name: 'is_daily' })
  isDaily: boolean;

  @Column({ default: false, name: 'is_weekly' })
  isWeekly: boolean;

  @Column({ default: false, name: 'is_main_story' })
  isMainStory: boolean;

  @Column({ type: 'jsonb', nullable: true })
  prerequisites: number[];

  @Column({ type: 'jsonb', nullable: true, name: 'required_reputation' })
  requiredReputation: Record<string, any>;

  @Column({ default: 0, name: 'reward_experience' })
  rewardExperience: number;

  @Column({ default: 0, name: 'reward_gold' })
  rewardGold: number;

  @Column({ type: 'jsonb', nullable: true, name: 'reward_items' })
  rewardItems: { itemId: number, quantity: number, chance: number }[];

  @Column({ type: 'jsonb', nullable: true, name: 'reward_reputation' })
  rewardReputation: Record<string, number>;

  @Column({ nullable: true, name: 'icon_path' })
  iconPath: string;
}