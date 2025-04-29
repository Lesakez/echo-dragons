// src/models/skill.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'skill_type', length: 50 })
  skillType: string;

  @Column({ name: 'class_requirement', length: 50, nullable: true })
  classRequirement: string;

  @Column({ name: 'faction_requirement', length: 20, nullable: true })
  factionRequirement: string;

  @Column({ default: 1, name: 'level_requirement' })
  levelRequirement: number;

  @Column({ default: 0, name: 'mana_cost' })
  manaCost: number;

  @Column({ default: 0, name: 'rage_cost' })
  rageCost: number;

  @Column({ default: 0, name: 'energy_cost' })
  energyCost: number;

  @Column({ default: 0, name: 'cooldown_seconds' })
  cooldownSeconds: number;

  @Column({ default: 0, name: 'base_damage' })
  baseDamage: number;

  @Column({ default: 0, name: 'base_healing' })
  baseHealing: number;

  @Column({ type: 'jsonb', nullable: true })
  effects: Record<string, any>;

  @Column({ name: 'icon_path', nullable: true })
  iconPath: string;
}