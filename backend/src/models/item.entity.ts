// src/models/item.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, nullable: true })
  subtype: string;

  @Column({ length: 20 })
  rarity: string;

  @Column({ default: 1, name: 'level_requirement' })
  levelRequirement: number;

  @Column({ nullable: true, name: 'class_requirement' })
  classRequirement: string;

  @Column({ nullable: true, name: 'faction_requirement' })
  factionRequirement: string;

  @Column({ default: false })
  stackable: boolean;

  @Column({ default: true })
  sellable: boolean;

  @Column({ default: true })
  tradeable: boolean;

  @Column({ default: 0, name: 'base_price' })
  basePrice: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  attributes: Record<string, any>;

  @Column({ name: 'icon_path', nullable: true })
  iconPath: string;
}