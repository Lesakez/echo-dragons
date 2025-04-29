// src/inventory/inventory.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../models/character.entity';
import { InventorySlot } from '../models/inventory-slot.entity';
import { Item } from '../models/item.entity';
import { ItemModification } from '../models/item-modification.entity';

@Injectable()
export class InventoryService {
  // Максимальный размер инвентаря персонажа
  private readonly MAX_INVENTORY_SIZE = 20;
  
  // Типы слотов экипировки
  private readonly EQUIPMENT_SLOTS = [
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

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(InventorySlot)
    private inventorySlotRepository: Repository<InventorySlot>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(ItemModification)
    private itemModificationRepository: Repository<ItemModification>,
  ) {}

  /**
   * Получение инвентаря персонажа
   */
  async getCharacterInventory(characterId: number, userId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Получаем все слоты инвентаря персонажа
    const inventorySlots = await this.inventorySlotRepository.find({
      where: { characterId },
      relations: ['item', 'modifications'],
    });

    // Разделяем слоты на обычные и экипировку
    const equippedItems = inventorySlots.filter(
      slot => this.EQUIPMENT_SLOTS.includes(slot.slotType)
    );
    
    const backpackItems = inventorySlots.filter(
      slot => slot.slotType === 'backpack'
    );
    
    // Создаем массив для всех слотов рюкзака (включая пустые)
    const backpack = Array(this.MAX_INVENTORY_SIZE).fill(null);
    
    // Заполняем массив существующими слотами
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

  /**
   * Экипировка предмета
   */
  async equipItem(characterId: number, userId: number, inventorySlotId: number, equipSlotType: string) {
    // Проверяем валидность слота экипировки
    if (!this.EQUIPMENT_SLOTS.includes(equipSlotType)) {
      throw new BadRequestException(`Недопустимый тип слота: ${equipSlotType}`);
    }
    
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }
    
    // Находим слот инвентаря с предметом
    const inventorySlot = await this.inventorySlotRepository.findOne({
      where: { id: inventorySlotId, characterId },
      relations: ['item']
    });
    
    if (!inventorySlot || !inventorySlot.item) {
      throw new NotFoundException('Слот или предмет не найден');
    }
    
    // Проверяем, можно ли экипировать этот предмет в указанный слот
    if (!this.canEquipItemInSlot(inventorySlot.item, equipSlotType)) {
      throw new BadRequestException(`Предмет ${inventorySlot.item.name} нельзя экипировать в слот ${equipSlotType}`);
    }
    
    // Проверяем соответствие предмета уровню и классу персонажа
    if (inventorySlot.item.levelRequirement > character.level) {
      throw new BadRequestException(`Требуется уровень ${inventorySlot.item.levelRequirement}`);
    }
    
    if (inventorySlot.item.classRequirement && inventorySlot.item.classRequirement !== character.class) {
      throw new BadRequestException(`Этот предмет могут использовать только ${inventorySlot.item.classRequirement}`);
    }
    
    // Находим текущий предмет в слоте экипировки, если есть
    const currentEquipSlot = await this.inventorySlotRepository.findOne({
      where: { characterId, slotType: equipSlotType },
      relations: ['item']
    });
    
    // Начинаем транзакцию
    // Тут в реальном проекте должна быть транзакция
    
    if (currentEquipSlot) {
      // Если слот занят, снимаем текущий предмет и помещаем в рюкзак
      const freeBackpackSlot = await this.findFreeBackpackSlot(characterId);
      
      if (!freeBackpackSlot) {
        throw new BadRequestException('Нет свободного места в рюкзаке для снятия текущего предмета');
      }
      
      // Перемещаем текущий предмет в рюкзак
      currentEquipSlot.slotType = 'backpack';
      currentEquipSlot.slotIndex = freeBackpackSlot;
      await this.inventorySlotRepository.save(currentEquipSlot);
    }
    
    // Перемещаем новый предмет из рюкзака в слот экипировки
    inventorySlot.slotType = equipSlotType;
    inventorySlot.slotIndex = 0; // Индекс не используется для слотов экипировки
    
    await this.inventorySlotRepository.save(inventorySlot);
    
    // Обновляем характеристики персонажа на основе экипировки
    await this.updateCharacterStats(characterId);
    
    return this.getCharacterInventory(characterId, userId);
  }

  /**
   * Снятие предмета
   */
  async unequipItem(characterId: number, userId: number, equipSlotType: string) {
    // Проверяем валидность слота экипировки
    if (!this.EQUIPMENT_SLOTS.includes(equipSlotType)) {
      throw new BadRequestException(`Недопустимый тип слота: ${equipSlotType}`);
    }
    
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }
    
    // Находим слот экипировки с предметом
    const equipSlot = await this.inventorySlotRepository.findOne({
      where: { characterId, slotType: equipSlotType },
      relations: ['item']
    });
    
    if (!equipSlot || !equipSlot.item) {
      throw new NotFoundException(`Нет предмета в слоте ${equipSlotType}`);
    }
    
    // Ищем свободный слот в рюкзаке
    const freeBackpackSlot = await this.findFreeBackpackSlot(characterId);
    
    if (freeBackpackSlot === null) {
      throw new BadRequestException('Нет свободного места в рюкзаке');
    }
    
    // Перемещаем предмет в рюкзак
    equipSlot.slotType = 'backpack';
    equipSlot.slotIndex = freeBackpackSlot;
    
    await this.inventorySlotRepository.save(equipSlot);
    
    // Обновляем характеристики персонажа
    await this.updateCharacterStats(characterId);
    
    return this.getCharacterInventory(characterId, userId);
  }

  /**
   * Использование предмета
   */
  async useItem(characterId: number, userId: number, inventorySlotId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }
    
    // Находим слот инвентаря с предметом
    const inventorySlot = await this.inventorySlotRepository.findOne({
      where: { id: inventorySlotId, characterId },
      relations: ['item']
    });
    
    if (!inventorySlot || !inventorySlot.item) {
      throw new NotFoundException('Слот или предмет не найден');
    }
    
    const item = inventorySlot.item;
    
    // Проверяем, можно ли использовать предмет
    if (item.type !== 'potion' && item.type !== 'scroll' && item.type !== 'food') {
      throw new BadRequestException('Этот предмет нельзя использовать');
    }
    
    // Применяем эффект предмета
    switch (item.type) {
      case 'potion':
        // Реализация эффектов зелий
        if (item.subtype === 'healing') {
          // Восстанавливаем здоровье
          const healAmount = item.attributes?.healingAmount || 50;
          character.health = Math.min(character.maxHealth, character.health + healAmount);
        } else if (item.subtype === 'mana') {
          // Восстанавливаем ману
          const manaAmount = item.attributes?.manaAmount || 50;
          character.mana = Math.min(character.maxMana, character.mana + manaAmount);
        }
        break;
        
      case 'food':
        // Реализация эффектов еды (восстановление здоровья со временем)
        const healthRegen = item.attributes?.healthRegen || 10;
        character.health = Math.min(character.maxHealth, character.health + healthRegen);
        break;
        
      case 'scroll':
        // Реализация эффектов свитков (различные временные бонусы)
        // Для простоты не реализуем полностью
        break;
    }
    
    // Сохраняем обновленные характеристики персонажа
    await this.characterRepository.save(character);
    
    // Уменьшаем количество предметов в стаке или удаляем предмет
    if (inventorySlot.quantity > 1) {
      inventorySlot.quantity -= 1;
      await this.inventorySlotRepository.save(inventorySlot);
    } else {
      await this.inventorySlotRepository.remove(inventorySlot);
    }
    
    return this.getCharacterInventory(characterId, userId);
  }

  /**
   * Перемещение предмета в инвентаре
   */
  async moveItem(characterId: number, userId: number, fromSlotIndex: number, toSlotIndex: number) {
    // Проверяем валидность индексов слотов
    if (
      fromSlotIndex < 0 || 
      fromSlotIndex >= this.MAX_INVENTORY_SIZE || 
      toSlotIndex < 0 || 
      toSlotIndex >= this.MAX_INVENTORY_SIZE
    ) {
      throw new BadRequestException('Недопустимый индекс слота');
    }
    
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }
    
    // Находим исходный слот
    const fromSlot = await this.inventorySlotRepository.findOne({
      where: { characterId, slotType: 'backpack', slotIndex: fromSlotIndex },
      relations: ['item']
    });
    
    if (!fromSlot || !fromSlot.item) {
      throw new NotFoundException('Исходный слот или предмет не найден');
    }
    
    // Находим целевой слот (если есть)
    const toSlot = await this.inventorySlotRepository.findOne({
      where: { characterId, slotType: 'backpack', slotIndex: toSlotIndex },
      relations: ['item']
    });
    
    // Если целевой слот пуст, просто перемещаем предмет
    if (!toSlot) {
      fromSlot.slotIndex = toSlotIndex;
      await this.inventorySlotRepository.save(fromSlot);
    } 
    // Если в целевом слоте есть предмет, меняем их местами
    else {
      const tempIndex = fromSlot.slotIndex;
      fromSlot.slotIndex = toSlot.slotIndex;
      toSlot.slotIndex = tempIndex;
      
      await this.inventorySlotRepository.save([fromSlot, toSlot]);
    }
    
    return this.getCharacterInventory(characterId, userId);
  }

  /**
   * Удаление предмета из инвентаря
   */
  async deleteItem(characterId: number, userId: number, inventorySlotId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }
    
    // Находим слот инвентаря с предметом
    const inventorySlot = await this.inventorySlotRepository.findOne({
      where: { id: inventorySlotId, characterId },
      relations: ['item', 'modifications']
    });
    
    if (!inventorySlot) {
      throw new NotFoundException('Слот не найден');
    }
    
    // Сначала удаляем все модификации предмета
    if (inventorySlot.modifications && inventorySlot.modifications.length > 0) {
      await this.itemModificationRepository.remove(inventorySlot.modifications);
    }
    
    // Затем удаляем сам слот
    await this.inventorySlotRepository.remove(inventorySlot);
    
    return this.getCharacterInventory(characterId, userId);
  }

  /**
   * Вспомогательные методы
   */
  
  /**
   * Проверяет, можно ли экипировать предмет в указанный слот
   */
  private canEquipItemInSlot(item: Item, slotType: string): boolean {
    // Реализация зависит от логики вашей игры
    // Пример простой реализации:
    switch (item.type) {
      case 'weapon':
        if (item.subtype === 'one_handed') {
          return slotType === 'mainhand' || slotType === 'offhand';
        } else if (item.subtype === 'two_handed') {
          return slotType === 'mainhand';
        } else if (item.subtype === 'ranged') {
          return slotType === 'ranged';
        }
        break;
        
      case 'armor':
        if (item.subtype === 'head') return slotType === 'head';
        if (item.subtype === 'chest') return slotType === 'chest';
        if (item.subtype === 'legs') return slotType === 'legs';
        if (item.subtype === 'feet') return slotType === 'feet';
        if (item.subtype === 'hands') return slotType === 'hands';
        if (item.subtype === 'waist') return slotType === 'waist';
        if (item.subtype === 'wrists') return slotType === 'wrists';
        if (item.subtype === 'shoulders') return slotType === 'shoulders';
        break;
        
      case 'accessory':
        if (item.subtype === 'neck') return slotType === 'neck';
        if (item.subtype === 'back') return slotType === 'back';
        if (item.subtype === 'finger') return slotType === 'finger1' || slotType === 'finger2';
        if (item.subtype === 'trinket') return slotType === 'trinket1' || slotType === 'trinket2';
        break;
    }
    
    return false;
  }
  
  /**
   * Ищет свободный слот в рюкзаке
   */
  private async findFreeBackpackSlot(characterId: number): Promise<number | null> {
    // Получаем все занятые слоты рюкзака
    const occupiedSlots = await this.inventorySlotRepository.find({
      where: { characterId, slotType: 'backpack' },
      select: ['slotIndex']
    });
    
    // Создаем массив занятых индексов
    const occupiedIndices = occupiedSlots.map(slot => slot.slotIndex);
    
    // Ищем первый свободный индекс
    for (let i = 0; i < this.MAX_INVENTORY_SIZE; i++) {
      if (!occupiedIndices.includes(i)) {
        return i;
      }
    }
    
    // Если свободных слотов нет
    return null;
  }
  
  /**
   * Обновляет характеристики персонажа на основе экипировки
   */
  private async updateCharacterStats(characterId: number): Promise<void> {
    // Получаем персонажа
    const character = await this.characterRepository.findOne({
      where: { id: characterId }
    });
    
    if (!character) {
      throw new NotFoundException('Персонаж не найден');
    }
    
    // Получаем все экипированные предметы
    const equippedItems = await this.inventorySlotRepository.find({
      where: { 
        characterId, 
        slotType: this.EQUIPMENT_SLOTS 
      },
      relations: ['item', 'modifications']
    });
    
    // Сбрасываем характеристики персонажа до базовых
    // В реальности здесь нужно будет сохранять базовые значения отдельно
    // Для примера используем упрощенный подход
    
    // Считаем бонусы от экипировки
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
        // Добавляем бонусы от базовых характеристик предмета
        bonusHealth += slot.item.attributes.health || 0;
        bonusMana += slot.item.attributes.mana || 0;
        bonusStrength += slot.item.attributes.strength || 0;
        bonusDexterity += slot.item.attributes.dexterity || 0;
        bonusIntuition += slot.item.attributes.intuition || 0;
        bonusEndurance += slot.item.attributes.endurance || 0;
        bonusIntelligence += slot.item.attributes.intelligence || 0;
        bonusWisdom += slot.item.attributes.wisdom || 0;
      }
      
      // Добавляем бонусы от модификаций предмета
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
    
    // Обновляем максимальное здоровье и ману
    character.maxHealth += bonusHealth;
    character.maxMana += bonusMana;
    
    // Обновляем текущее здоровье и ману, если они превышают максимум
    if (character.health > character.maxHealth) {
      character.health = character.maxHealth;
    }
    
    if (character.mana > character.maxMana) {
      character.mana = character.maxMana;
    }
    
    // Обновляем характеристики
    character.strength += bonusStrength;
    character.dexterity += bonusDexterity;
    character.intuition += bonusIntuition;
    character.endurance += bonusEndurance;
    character.intelligence += bonusIntelligence;
    character.wisdom += bonusWisdom;
    
    // Сохраняем персонажа
    await this.characterRepository.save(character);
  }
}