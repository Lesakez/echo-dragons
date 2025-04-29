// src/models/faction.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { CharacterReputation } from './character-reputation.entity';

@Entity('factions')
export class Faction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false, name: 'is_major' })
  isMajor: boolean;

  @Column({ nullable: true, name: 'parent_faction_id' })
  parentFactionId: number;

  @ManyToOne(() => Faction, { nullable: true })
  @JoinColumn({ name: 'parent_faction_id' })
  parentFaction: Faction;

  @Column({ default: 0, name: 'starting_reputation' })
  startingReputation: number;

  @Column({ type: 'jsonb', nullable: true, name: 'hostile_towards' })
  hostileTowards: number[];

  @OneToMany(() => CharacterReputation, characterReputation => characterReputation.faction)
  characterReputations: CharacterReputation[];

  @OneToMany(() => Faction, faction => faction.parentFaction)
  subFactions: Faction[];
}