import { InventorySlot } from './inventory-slot.entity';
export declare class ItemModification {
    id: number;
    inventorySlotId: number;
    inventorySlot: InventorySlot;
    modificationType: string;
    level: number;
    bonusAttributes: Record<string, any>;
    createdAt: Date;
}
