import { InventoryService } from './inventory.service';
import { Request } from 'express';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    getCharacterInventory(characterId: string, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
    equipItem(characterId: string, body: {
        inventorySlotId: number;
        equipSlotType: string;
    }, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
    unequipItem(characterId: string, body: {
        equipSlotType: string;
    }, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
    useItem(characterId: string, body: {
        inventorySlotId: number;
    }, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
    moveItem(characterId: string, body: {
        fromSlotIndex: number;
        toSlotIndex: number;
    }, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
    deleteItem(characterId: string, inventorySlotId: string, req: Request): Promise<{
        equipped: import("../models/inventory-slot.entity").InventorySlot[];
        backpack: any[];
    }>;
}
