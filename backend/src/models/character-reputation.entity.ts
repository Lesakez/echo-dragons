// src/models/character-reputation.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Character } from './character.entity';
import { Faction } from './faction.entity';

@Entity('character_reputation')
export class CharacterReputation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'character_id' })
  characterId: number;

  @ManyToOne(() => Character, character => character.reputations)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'faction_id' })
  factionId: number;

  @ManyToOne(() => Faction, faction => faction.characterReputations)
  @JoinColumn({ name: 'faction_id' })
  faction: Faction;

  @Column({ default: 0, name: 'reputation_value' })
  reputationValue: number;
}