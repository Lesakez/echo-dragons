// src/models/monster-spawn.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Monster } from './monster.entity';

@Entity('monster_spawns')
export class MonsterSpawn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'monster_id' })
  monsterId: number;

  @ManyToOne(() => Monster, monster => monster.spawns)
  @JoinColumn({ name: 'monster_id' })
  monster: Monster;

  @Column({ type: 'float', name: 'x_position' })
  xPosition: number;

  @Column({ type: 'float', name: 'y_position' })
  yPosition: number;

  @Column({ name: 'map_id', length: 50 })
  mapId: string;

  @Column({ nullable: true, name: 'spawn_group' })
  spawnGroup: number;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'respawn_timer' })
  respawnTimer: Date;
}