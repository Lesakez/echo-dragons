// src/models/guild.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { GuildMember } from './guild-member.entity';

@Entity('guilds')
export class Guild {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 20 })
  faction: string;

  @Column({ name: 'leader_id' })
  leaderId: number;

  @ManyToOne(() => Character)
  @JoinColumn({ name: 'leader_id' })
  leader: Character;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  emblem: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 0 })
  gold: number;

  @OneToMany(() => GuildMember, guildMember => guildMember.guild)
  members: GuildMember[];
}