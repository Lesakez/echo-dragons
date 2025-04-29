// src/quests/quests.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../models/character.entity';
import { Quest } from '../models/quest.entity';
import { CharacterQuest } from '../models/character-quest.entity';
import { Npc } from '../models/npc.entity';
import { CharacterReputation } from '../models/character-reputation.entity';

@Injectable()
export class QuestsService {
  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(CharacterQuest)
    private characterQuestRepository: Repository<CharacterQuest>,
    @InjectRepository(Npc)
    private npcRepository: Repository<Npc>,
  ) {}

  /**
   * Получение всех квестов
   */
  async getAllQuests() {
    return this.questRepository.find();
  }

  /**
   * Получение квестов персонажа
   */
  async getCharacterQuests(characterId: number, userId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Получаем все квесты персонажа с информацией о квесте
    const characterQuests = await this.characterQuestRepository.find({
      where: { characterId },
      relations: ['quest']
    });

    return characterQuests;
  }

  /**
   * Получение доступных для персонажа квестов
   */
  async getAvailableQuests(characterId: number, userId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
      relations: ['reputations', 'quests', 'quests.quest']
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Получаем все квесты
    const allQuests = await this.questRepository.find();

    // Фильтруем квесты, которые доступны для персонажа
    const availableQuests = allQuests.filter(quest => {
      // Проверяем, не взят ли уже этот квест
      const isQuestActive = character.quests.some(
        cq => cq.questId === quest.id && cq.status !== 'completed'
      );

      if (isQuestActive) {
        return false;
      }

      // Проверяем, не выполнен ли уже этот квест (для неповторяемых)
      const isQuestCompleted = character.quests.some(
        cq => cq.questId === quest.id && cq.status === 'completed'
      );

      if (isQuestCompleted && !quest.isRepeatable) {
        return false;
      }

      // Проверяем требования по уровню
      if (character.level < quest.minLevel || character.level > quest.maxLevel) {
        return false;
      }

      // Проверяем требования по фракции
      if (quest.faction && quest.faction !== character.faction) {
        return false;
      }

      // Проверяем требования по репутации
      if (quest.requiredReputation) {
        for (const [factionName, requiredValue] of Object.entries(quest.requiredReputation)) {
          const reputation = character.reputations.find(
            r => r.faction.name === factionName
          );

          if (!reputation || reputation.reputationValue < requiredValue) {
            return false;
          }
        }
      }

      // Проверяем предварительные квесты
      if (quest.prerequisites && quest.prerequisites.length > 0) {
        for (const prereqId of quest.prerequisites) {
          const prereqCompleted = character.quests.some(
            cq => cq.questId === prereqId && cq.status === 'completed'
          );
          
          if (!prereqCompleted) {
            return false;
          }
        }
      }

      // Все требования выполнены, квест доступен
      return true;
    });

    return availableQuests;
  }

  /**
   * Принятие квеста
   */
  async acceptQuest(characterId: number, userId: number, questId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
      relations: ['quests', 'quests.quest']
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Проверяем, существует ли квест
    const quest = await this.questRepository.findOne({
      where: { id: questId }
    });

    if (!quest) {
      throw new NotFoundException('Квест не найден');
    }

    // Проверяем, не взят ли уже этот квест
    const existingQuest = character.quests.find(
      cq => cq.questId === questId && cq.status !== 'completed'
    );

    if (existingQuest) {
      throw new BadRequestException('Этот квест уже взят');
    }

    // Проверяем, не выполнен ли уже этот квест (для неповторяемых)
    const completedQuest = character.quests.find(
      cq => cq.questId === questId && cq.status === 'completed'
    );

    if (completedQuest && !quest.isRepeatable) {
      throw new BadRequestException('Этот квест уже выполнен и не может быть повторен');
    }

    // Проверяем требования по уровню
    if (character.level < quest.minLevel) {
      throw new BadRequestException(`Требуется уровень ${quest.minLevel}`);
    }

    if (character.level > quest.maxLevel) {
      throw new BadRequestException(`Ваш уровень слишком высок для этого квеста`);
    }

    // Проверяем требования по фракции
    if (quest.faction && quest.faction !== character.faction) {
      throw new BadRequestException(`Этот квест доступен только для фракции ${quest.faction}`);
    }

    // Создаем новую запись о квесте персонажа
    const characterQuest = this.characterQuestRepository.create({
      characterId,
      questId,
      status: 'active',
      currentObjectives: this.initializeQuestObjectives(quest),
    });

    await this.characterQuestRepository.save(characterQuest);

    return this.getCharacterQuests(characterId, userId);
  }

  /**
   * Выполнение квеста
   */
  async completeQuest(characterId: number, userId: number, characterQuestId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Находим запись о квесте персонажа
    const characterQuest = await this.characterQuestRepository.findOne({
      where: { id: characterQuestId, characterId },
      relations: ['quest']
    });

    if (!characterQuest) {
      throw new NotFoundException('Квест не найден');
    }

    if (characterQuest.status !== 'active') {
      throw new BadRequestException('Этот квест не активен');
    }

    // Проверяем, выполнены ли все цели квеста
    if (!this.areQuestObjectivesComplete(characterQuest)) {
      throw new BadRequestException('Не все цели квеста выполнены');
    }

    // Обновляем статус квеста
    characterQuest.status = 'completed';
    characterQuest.completedAt = new Date();
    await this.characterQuestRepository.save(characterQuest);

    // Выдаем награду за квест
    await this.giveQuestRewards(character, characterQuest.quest);

    return this.getCharacterQuests(characterId, userId);
  }

  /**
   * Отказ от квеста
   */
  async abandonQuest(characterId: number, userId: number, characterQuestId: number) {
    // Проверяем, существует ли персонаж и принадлежит ли он пользователю
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId }
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    // Находим запись о квесте персонажа
    const characterQuest = await this.characterQuestRepository.findOne({
      where: { id: characterQuestId, characterId }
    });

    if (!characterQuest) {
      throw new NotFoundException('Квест не найден');
    }

    if (characterQuest.status !== 'active') {
      throw new BadRequestException('Этот квест не активен');
    }

    // Удаляем запись о квесте
    await this.characterQuestRepository.remove(characterQuest);

    return this.getCharacterQuests(characterId, userId);
  }

  /**
   * Получение квестов NPC
   */
  async getNpcQuests(npcId: number) {
    // Находим NPC
    const npc = await this.npcRepository.findOne({
      where: { id: npcId }
    });

    if (!npc) {
      throw new NotFoundException('NPC не найден');
    }

    // Если NPC не выдает квесты, возвращаем пустой массив
    if (!npc.isQuestGiver || !npc.availableQuests || npc.availableQuests.length === 0) {
      return [];
    }

    // Находим все квесты, которые выдает этот NPC
    const quests = await this.questRepository.findBy({
      id: npc.availableQuests
    });

    return quests;
  }

  /**
   * Инициализация целей квеста
   */
  private initializeQuestObjectives(quest: Quest): Record<string, any> {
    // Примерная реализация - в реальности будет зависеть от структуры квестов
    // Например, для квеста "убить 10 монстров" мы можем создать такую структуру:
    // { "kill_monsters": { count: 0, required: 10, type: "kill", target: "goblin" } }
    
    // Для простоты вернем пустой объект
    return {};
  }

  /**
   * Проверка, выполнены ли все цели квеста
   */
  private areQuestObjectivesComplete(characterQuest: CharacterQuest): boolean {
    // Примерная реализация - в реальности будет проверка на основе структуры целей
    
    // Для примера просто вернем true, как будто квест выполнен
    return true;
  }

  /**
   * Выдача наград за квест
   */
  private async giveQuestRewards(character: Character, quest: Quest): Promise<void> {
    // Опыт
    if (quest.rewardExperience > 0) {
      character.addExperience(quest.rewardExperience);
    }

    // Золото
    if (quest.rewardGold > 0) {
      character.gold += quest.rewardGold;
    }

    // Репутация с фракциями
    if (quest.rewardReputation) {
      for (const [factionName, reputationGain] of Object.entries(quest.rewardReputation)) {
        // Реализация обновления репутации (упрощенно)
        // В реальности нужно найти запись репутации с нужной фракцией и обновить значение
      }
    }

    // Сохраняем персонажа
    await this.characterRepository.save(character);

    // Предметы
    // В реальности здесь нужно добавить предметы в инвентарь персонажа
    // Это потребует взаимодействия с InventoryService или другим сервисом
  }
}