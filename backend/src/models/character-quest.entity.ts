// src/models/character-quest.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Character } from './character.entity';
import { Quest } from './quest.entity';

@Entity('character_quests')
export class CharacterQuest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'character_id' })
  characterId: number;

  @ManyToOne(() => Character, character => character.quests)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'quest_id' })
  questId: number;

  @ManyToOne(() => Quest)
  @JoinColumn({ name: 'quest_id' })
  quest: Quest;

  @Column({ length: 20 })
  status: string;

  @Column({ type: 'jsonb', nullable: true, name: 'current_objectives' })
  currentObjectives: Record<string, any>;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'completed_at' })
  completedAt: Date;
}