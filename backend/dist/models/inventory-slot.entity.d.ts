import { Character } from './character.entity';
import { Item } from './item.entity';
import { ItemModification } from './item-modification.entity';
export declare class InventorySlot {
    id: number;
    characterId: number;
    character: Character;
    slotType: string;
    slotIndex: number;
    itemId: number;
    item: Item;
    quantity: number;
    modifications: ItemModification[];
}
