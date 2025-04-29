// src/models/inventory-slot.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Character } from './character.entity';
import { Item } from './item.entity';
import { ItemModification } from './item-modification.entity';

@Entity('inventory_slots')
export class InventorySlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'character_id' })
  characterId: number;

  @ManyToOne(() => Character, character => character.inventorySlots)
  @JoinColumn({ name: 'character_id' })
  character: Character;

  @Column({ name: 'slot_type', length: 20 })
  slotType: string;

  @Column({ name: 'slot_index' })
  slotIndex: number;

  @Column({ name: 'item_id', nullable: true })
  itemId: number;

  @ManyToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ default: 1 })
  quantity: number;

  @OneToMany(() => ItemModification, itemModification => itemModification.inventorySlot)
  modifications: ItemModification[];
}