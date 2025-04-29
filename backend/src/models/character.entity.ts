// src/models/character.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { InventorySlot } from './inventory-slot.entity';
import { CharacterSkill } from './character-skill.entity';
import { CharacterQuest } from './character-quest.entity';
import { CharacterReputation } from './character-reputation.entity';
import { GuildMember } from './guild-member.entity';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, user => user.characters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 20 })
  faction: string;

  @Column({ length: 20 })
  class: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 100 })
  health: number;

  @Column({ default: 100, name: 'max_health' })
  maxHealth: number;

  @Column({ default: 100 })
  mana: number;

  @Column({ default: 100, name: 'max_mana' })
  maxMana: number;

  @Column({ default: 10 })
  strength: number;

  @Column({ default: 10 })
  dexterity: number;

  @Column({ default: 10 })
  intuition: number;

  @Column({ default: 10 })
  endurance: number;

  @Column({ default: 10 })
  intelligence: number;

  @Column({ default: 10 })
  wisdom: number;

  @Column({ default: 0, name: 'available_stat_points' })
  availableStatPoints: number;

  @Column({ default: 0, name: 'available_skill_points' })
  availableSkillPoints: number;

  @Column({ type: 'float', default: 0, name: 'x_position' })
  xPosition: number;

  @Column({ type: 'float', default: 0, name: 'y_position' })
  yPosition: number;

  @Column({ length: 50, default: 'starting_area', name: 'current_map' })
  currentMap: string;

  @Column({ default: 100 })
  gold: number;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => InventorySlot, inventorySlot => inventorySlot.character)
  inventorySlots: InventorySlot[];

  @OneToMany(() => CharacterSkill, characterSkill => characterSkill.character)
  skills: CharacterSkill[];

  @OneToMany(() => CharacterQuest, characterQuest => characterQuest.character)
  quests: CharacterQuest[];

  @OneToMany(() => CharacterReputation, characterReputation => characterReputation.character)
  reputations: CharacterReputation[];

  @OneToMany(() => GuildMember, guildMember => guildMember.character)
  guildMembership: GuildMember;
}