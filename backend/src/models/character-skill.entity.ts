// src/models/character-skill.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Character } from './character.entity';
import { Skill } from './skill.entity';

@Entity('character_skills')
export class CharacterSkill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'character_id' })
  characterId: number;

  @ManyToOne(() => Character, character => character.skills)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'skill_id' })
  skillId: number;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'cooldown_until' })
  cooldownUntil: Date;
}