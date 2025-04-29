import { Repository } from 'typeorm';
import { Character } from '../models/character.entity';
import { InventorySlot } from '../models/inventory-slot.entity';
import { Item } from '../models/item.entity';
import { ItemModification } from '../models/item-modification.entity';
export declare class InventoryService {
    private characterRepository;
    private inventorySlotRepository;
    private itemRepository;
    private itemModificationRepository;
    private readonly MAX_INVENTORY_SIZE;
    private readonly EQUIPMENT_SLOTS;
    constructor(characterRepository: Repository<Character>, inventorySlotRepository: Repository<InventorySlot>, itemRepository: Repository<Item>, itemModificationRepository: Repository<ItemModification>);
    getCharacterInventory(characterId: number, userId: number): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    equipItem(characterId: number, userId: number, inventorySlotId: number, equipSlotType: string): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    unequipItem(characterId: number, userId: number, equipSlotType: string): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    useItem(characterId: number, userId: number, inventorySlotId: number): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    moveItem(characterId: number, userId: number, fromSlotIndex: number, toSlotIndex: number): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    deleteItem(characterId: number, userId: number, inventorySlotId: number): Promise<{
        equipped: InventorySlot[];
        backpack: any[];
    }>;
    private canEquipItemInSlot;
    private findFreeBackpackSlot;
    private updateCharacterStats;
}
