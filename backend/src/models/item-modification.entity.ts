// src/models/item-modification.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { InventorySlot } from './inventory-slot.entity';

@Entity('item_modifications')
export class ItemModification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'inventory_slot_id' })
  inventorySlotId: number;

  @ManyToOne(() => InventorySlot, inventorySlot => inventorySlot.modifications)
  @JoinColumn({ name: 'inventory_slot_id' })
  inventorySlot: InventorySlot;

  @Column({ name: 'modification_type', length: 50 })
  modificationType: string;

  @Column({ default: 1 })
  level: number;

  @Column({ type: 'jsonb', name: 'bonus_attributes', nullable: true })
  bonusAttributes: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt: Date;
}