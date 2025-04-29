import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Character } from './character.entity';
import { Guild } from './guild.entity';

@Entity('guild_members')
export class GuildMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'guild_id' })
  guildId: number;

  @ManyToOne(() => Guild, guild => guild.members)
  @JoinColumn({ name: 'guild_id' })
  guild: Guild;

  @Column({ name: 'character_id' })
  characterId: number;

  @ManyToOne(() => Character, character => character.guildMember)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ length: 50 })
  rank: string;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'joined_at' })
  joinedAt: Date;
}