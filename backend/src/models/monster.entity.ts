// src/models/monster.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { MonsterSpawn } from './monster-spawn.entity';

@Entity('monsters')
export class Monster {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'monster_type', length: 50 })
  monsterType: string;

  @Column()
  level: number;

  @Column()
  health: number;

  @Column({ default: 0 })
  mana: number;

  @Column({ name: 'damage_min' })
  damageMin: number;

  @Column({ name: 'damage_max' })
  damageMax: number;

  @Column({ default: 0 })
  armor: number;

  @Column({ default: 0, name: 'magic_resistance' })
  magicResistance: number;

  @Column({ name: 'experience_reward' })
  experienceReward: number;

  @Column({ default: 0, name: 'gold_reward_min' })
  goldRewardMin: number;

  @Column({ default: 0, name: 'gold_reward_max' })
  goldRewardMax: number;

  @Column({ default: 10, name: 'aggro_range' })
  aggroRange: number;

  @Column({ type: 'jsonb', nullable: true })
  abilities: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, name: 'loot_table' })
  lootTable: Record<string, any>;

  @Column({ default: 300, name: 'respawn_time' })
  respawnTime: number;

  @Column({ default: false, name: 'is_elite' })
  isElite: boolean;

  @Column({ default: false, name: 'is_boss' })
  isBoss: boolean;

  @OneToMany(() => MonsterSpawn, monsterSpawn => monsterSpawn.monster)
  spawns: MonsterSpawn[];
}