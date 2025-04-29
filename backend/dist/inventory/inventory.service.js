"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("../models/character.entity");
const inventory_slot_entity_1 = require("../models/inventory-slot.entity");
const item_entity_1 = require("../models/item.entity");
const item_modification_entity_1 = require("../models/item-modification.entity");
let InventoryService = class InventoryService {
    characterRepository;
    inventorySlotRepository;
    itemRepository;
    itemModificationRepository;
    MAX_INVENTORY_SIZE = 20;
    EQUIPMENT_SLOTS = [
        'head',
        'neck',
        'shoulders',
        'chest',
        'back',
        'wrists',
        'hands',
        'waist',
        'legs',
        'feet',
        'finger1',
        'finger2',
        'trinket1',
        'trinket2',
        'mainhand',
        'offhand',
        'ranged'
    ];
    constructor(characterRepository, inventorySlotRepository, itemRepository, itemModificationRepository) {
        this.characterRepository = characterRepository;
        this.inventorySlotRepository = inventorySlotRepository;
        this.itemRepository = itemRepository;
        this.itemModificationRepository = itemModificationRepository;
    }
    async getCharacterInventory(characterId, userId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const inventorySlots = await this.inventorySlotRepository.find({
            where: { characterId },
            relations: ['item', 'modifications'],
        });
        const equippedItems = inventorySlots.filter(slot => this.EQUIPMENT_SLOTS.includes(slot.slotType));
        const backpackItems = inventorySlots.filter(slot => slot.slotType === 'backpack');
        const backpack = Array(this.MAX_INVENTORY_SIZE).fill(null);
        backpackItems.forEach(slot => {
            if (slot.slotIndex >= 0 && slot.slotIndex < this.MAX_INVENTORY_SIZE) {
                backpack[slot.slotIndex] = slot;
            }
        });
        return {
            equipped: equippedItems,
            backpack
        };
    }
    async equipItem(characterId, userId, inventorySlotId, equipSlotType) {
        if (!this.EQUIPMENT_SLOTS.includes(equipSlotType)) {
            throw new common_1.BadRequestException(`Недопустимый тип слота: ${equipSlotType}`);
        }
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const inventorySlot = await this.inventorySlotRepository.findOne({
            where: { id: inventorySlotId, characterId },
            relations: ['item']
        });
        if (!inventorySlot || !inventorySlot.item) {
            throw new common_1.NotFoundException('Слот или предмет не найден');
        }
        if (!this.canEquipItemInSlot(inventorySlot.item, equipSlotType)) {
            throw new common_1.BadRequestException(`Предмет ${inventorySlot.item.name} нельзя экипировать в слот ${equipSlotType}`);
        }
        if (inventorySlot.item.levelRequirement > character.level) {
            throw new common_1.BadRequestException(`Требуется уровень ${inventorySlot.item.levelRequirement}`);
        }
        if (inventorySlot.item.classRequirement && inventorySlot.item.classRequirement !== character.class) {
            throw new common_1.BadRequestException(`Этот предмет могут использовать только ${inventorySlot.item.classRequirement}`);
        }
        const currentEquipSlot = await this.inventorySlotRepository.findOne({
            where: { characterId, slotType: equipSlotType },
            relations: ['item']
        });
        if (currentEquipSlot) {
            const freeBackpackSlot = await this.findFreeBackpackSlot(characterId);
            if (!freeBackpackSlot) {
                throw new common_1.BadRequestException('Нет свободного места в рюкзаке для снятия текущего предмета');
            }
            currentEquipSlot.slotType = 'backpack';
            currentEquipSlot.slotIndex = freeBackpackSlot;
            await this.inventorySlotRepository.save(currentEquipSlot);
        }
        inventorySlot.slotType = equipSlotType;
        inventorySlot.slotIndex = 0;
        await this.inventorySlotRepository.save(inventorySlot);
        await this.updateCharacterStats(characterId);
        return this.getCharacterInventory(characterId, userId);
    }
    async unequipItem(characterId, userId, equipSlotType) {
        if (!this.EQUIPMENT_SLOTS.includes(equipSlotType)) {
            throw new common_1.BadRequestException(`Недопустимый тип слота: ${equipSlotType}`);
        }
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const equipSlot = await this.inventorySlotRepository.findOne({
            where: { characterId, slotType: equipSlotType },
            relations: ['item']
        });
        if (!equipSlot || !equipSlot.item) {
            throw new common_1.NotFoundException(`Нет предмета в слоте ${equipSlotType}`);
        }
        const freeBackpackSlot = await this.findFreeBackpackSlot(characterId);
        if (freeBackpackSlot === null) {
            throw new common_1.BadRequestException('Нет свободного места в рюкзаке');
        }
        equipSlot.slotType = 'backpack';
        equipSlot.slotIndex = freeBackpackSlot;
        await this.inventorySlotRepository.save(equipSlot);
        await this.updateCharacterStats(characterId);
        return this.getCharacterInventory(characterId, userId);
    }
    async useItem(characterId, userId, inventorySlotId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const inventorySlot = await this.inventorySlotRepository.findOne({
            where: { id: inventorySlotId, characterId },
            relations: ['item']
        });
        if (!inventorySlot || !inventorySlot.item) {
            throw new common_1.NotFoundException('Слот или предмет не найден');
        }
        const item = inventorySlot.item;
        if (item.type !== 'potion' && item.type !== 'scroll' && item.type !== 'food') {
            throw new common_1.BadRequestException('Этот предмет нельзя использовать');
        }
        switch (item.type) {
            case 'potion':
                if (item.subtype === 'healing') {
                    const healAmount = item.attributes?.healingAmount || 50;
                    character.health = Math.min(character.maxHealth, character.health + healAmount);
                }
                else if (item.subtype === 'mana') {
                    const manaAmount = item.attributes?.manaAmount || 50;
                    character.mana = Math.min(character.maxMana, character.mana + manaAmount);
                }
                break;
            case 'food':
                const healthRegen = item.attributes?.healthRegen || 10;
                character.health = Math.min(character.maxHealth, character.health + healthRegen);
                break;
            case 'scroll':
                break;
        }
        await this.characterRepository.save(character);
        if (inventorySlot.quantity > 1) {
            inventorySlot.quantity -= 1;
            await this.inventorySlotRepository.save(inventorySlot);
        }
        else {
            await this.inventorySlotRepository.remove(inventorySlot);
        }
        return this.getCharacterInventory(characterId, userId);
    }
    async moveItem(characterId, userId, fromSlotIndex, toSlotIndex) {
        if (fromSlotIndex < 0 ||
            fromSlotIndex >= this.MAX_INVENTORY_SIZE ||
            toSlotIndex < 0 ||
            toSlotIndex >= this.MAX_INVENTORY_SIZE) {
            throw new common_1.BadRequestException('Недопустимый индекс слота');
        }
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const fromSlot = await this.inventorySlotRepository.findOne({
            where: { characterId, slotType: 'backpack', slotIndex: fromSlotIndex },
            relations: ['item']
        });
        if (!fromSlot || !fromSlot.item) {
            throw new common_1.NotFoundException('Исходный слот или предмет не найден');
        }
        const toSlot = await this.inventorySlotRepository.findOne({
            where: { characterId, slotType: 'backpack', slotIndex: toSlotIndex },
            relations: ['item']
        });
        if (!toSlot) {
            fromSlot.slotIndex = toSlotIndex;
            await this.inventorySlotRepository.save(fromSlot);
        }
        else {
            const tempIndex = fromSlot.slotIndex;
            fromSlot.slotIndex = toSlot.slotIndex;
            toSlot.slotIndex = tempIndex;
            await this.inventorySlotRepository.save([fromSlot, toSlot]);
        }
        return this.getCharacterInventory(characterId, userId);
    }
    async deleteItem(characterId, userId, inventorySlotId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const inventorySlot = await this.inventorySlotRepository.findOne({
            where: { id: inventorySlotId, characterId },
            relations: ['item', 'modifications']
        });
        if (!inventorySlot) {
            throw new common_1.NotFoundException('Слот не найден');
        }
        if (inventorySlot.modifications && inventorySlot.modifications.length > 0) {
            await this.itemModificationRepository.remove(inventorySlot.modifications);
        }
        await this.inventorySlotRepository.remove(inventorySlot);
        return this.getCharacterInventory(characterId, userId);
    }
    canEquipItemInSlot(item, slotType) {
        switch (item.type) {
            case 'weapon':
                if (item.subtype === 'one_handed') {
                    return slotType === 'mainhand' || slotType === 'offhand';
                }
                else if (item.subtype === 'two_handed') {
                    return slotType === 'mainhand';
                }
                else if (item.subtype === 'ranged') {
                    return slotType === 'ranged';
                }
                break;
            case 'armor':
                if (item.subtype === 'head')
                    return slotType === 'head';
                if (item.subtype === 'chest')
                    return slotType === 'chest';
                if (item.subtype === 'legs')
                    return slotType === 'legs';
                if (item.subtype === 'feet')
                    return slotType === 'feet';
                if (item.subtype === 'hands')
                    return slotType === 'hands';
                if (item.subtype === 'waist')
                    return slotType === 'waist';
                if (item.subtype === 'wrists')
                    return slotType === 'wrists';
                if (item.subtype === 'shoulders')
                    return slotType === 'shoulders';
                break;
            case 'accessory':
                if (item.subtype === 'neck')
                    return slotType === 'neck';
                if (item.subtype === 'back')
                    return slotType === 'back';
                if (item.subtype === 'finger')
                    return slotType === 'finger1' || slotType === 'finger2';
                if (item.subtype === 'trinket')
                    return slotType === 'trinket1' || slotType === 'trinket2';
                break;
        }
        return false;
    }
    async findFreeBackpackSlot(characterId) {
        const occupiedSlots = await this.inventorySlotRepository.find({
            where: { characterId, slotType: 'backpack' },
            select: ['slotIndex']
        });
        const occupiedIndices = occupiedSlots.map(slot => slot.slotIndex);
        for (let i = 0; i < this.MAX_INVENTORY_SIZE; i++) {
            if (!occupiedIndices.includes(i)) {
                return i;
            }
        }
        return null;
    }
    async updateCharacterStats(characterId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId }
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден');
        }
        const equippedItems = await this.inventorySlotRepository.find({
            where: {
                characterId,
                slotType: (0, typeorm_2.In)(this.EQUIPMENT_SLOTS)
            },
            relations: ['item', 'modifications']
        });
        let bonusHealth = 0;
        let bonusMana = 0;
        let bonusStrength = 0;
        let bonusDexterity = 0;
        let bonusIntuition = 0;
        let bonusEndurance = 0;
        let bonusIntelligence = 0;
        let bonusWisdom = 0;
        for (const slot of equippedItems) {
            if (slot.item && slot.item.attributes) {
                bonusHealth += slot.item.attributes.health || 0;
                bonusMana += slot.item.attributes.mana || 0;
                bonusStrength += slot.item.attributes.strength || 0;
                bonusDexterity += slot.item.attributes.dexterity || 0;
                bonusIntuition += slot.item.attributes.intuition || 0;
                bonusEndurance += slot.item.attributes.endurance || 0;
                bonusIntelligence += slot.item.attributes.intelligence || 0;
                bonusWisdom += slot.item.attributes.wisdom || 0;
            }
            if (slot.modifications && slot.modifications.length > 0) {
                for (const mod of slot.modifications) {
                    if (mod.bonusAttributes) {
                        bonusHealth += mod.bonusAttributes.health || 0;
                        bonusMana += mod.bonusAttributes.mana || 0;
                        bonusStrength += mod.bonusAttributes.strength || 0;
                        bonusDexterity += mod.bonusAttributes.dexterity || 0;
                        bonusIntuition += mod.bonusAttributes.intuition || 0;
                        bonusEndurance += mod.bonusAttributes.endurance || 0;
                        bonusIntelligence += mod.bonusAttributes.intelligence || 0;
                        bonusWisdom += mod.bonusAttributes.wisdom || 0;
                    }
                }
            }
        }
        character.maxHealth += bonusHealth;
        character.maxMana += bonusMana;
        if (character.health > character.maxHealth) {
            character.health = character.maxHealth;
        }
        if (character.mana > character.maxMana) {
            character.mana = character.maxMana;
        }
        character.strength += bonusStrength;
        character.dexterity += bonusDexterity;
        character.intuition += bonusIntuition;
        character.endurance += bonusEndurance;
        character.intelligence += bonusIntelligence;
        character.wisdom += bonusWisdom;
        await this.characterRepository.save(character);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(inventory_slot_entity_1.InventorySlot)),
    __param(2, (0, typeorm_1.InjectRepository)(item_entity_1.Item)),
    __param(3, (0, typeorm_1.InjectRepository)(item_modification_entity_1.ItemModification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map