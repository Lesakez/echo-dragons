import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Character, Faction } from '../models/character.entity';
import { Quest } from '../models/quest.entity';
import { CharacterQuest } from '../models/character-quest.entity';
import { Npc } from '../models/npc.entity';
import { CharacterReputation } from '../models/character-reputation.entity';

interface QuestObjective {
  type: string;
  count: number;
  required: number;
  target?: string;
}

interface QuestReputation {
  [factionName: string]: number;
}

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
    @InjectRepository(CharacterReputation)
    private characterReputationRepository: Repository<CharacterReputation>,
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
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    const characterQuests = await this.characterQuestRepository.find({
      where: { characterId },
      relations: ['quest'],
    });

    return characterQuests;
  }

  /**
   * Получение доступных для персонажа квестов
   */
  async getAvailableQuests(characterId: number, userId: number) {
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
      relations: ['reputations', 'reputations.faction', 'quests', 'quests.quest'],
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    const allQuests = await this.questRepository.find();

    const availableQuests = allQuests.filter((quest) => {
      const isQuestActive = character.quests.some(
        (cq) => cq.questId === quest.id && cq.status !== 'completed',
      );

      if (isQuestActive) {
        return false;
      }

      const isQuestCompleted = character.quests.some(
        (cq) => cq.questId === quest.id && cq.status === 'completed',
      );

      if (isQuestCompleted && !quest.isRepeatable) {
        return false;
      }

      if (character.level < quest.minLevel || character.level > quest.maxLevel) {
        return false;
      }

      if (quest.faction && quest.faction !== character.faction) {
        return false;
      }

      if (quest.requiredReputation) {
        for (const [factionName, requiredValue] of Object.entries(quest.requiredReputation as QuestReputation)) {
          const reputation = character.reputations.find(
            (r) => r.faction.name === factionName,
          );

          if (!reputation || reputation.reputationValue < requiredValue) {
            return false;
          }
        }
      }

      if (quest.prerequisites && quest.prerequisites.length > 0) {
        for (const prereqId of quest.prerequisites) {
          const prereqCompleted = character.quests.some(
            (cq) => cq.questId === prereqId && cq.status === 'completed',
          );
          if (!prereqCompleted) {
            return false;
          }
        }
      }

      return true;
    });

    return availableQuests;
  }

  /**
   * Принятие квеста
   */
  async acceptQuest(characterId: number, userId: number, questId: number) {
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
      relations: ['quests', 'quests.quest'],
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    const quest = await this.questRepository.findOne({
      where: { id: questId },
    });

    if (!quest) {
      throw new NotFoundException('Квест не найден');
    }

    const existingQuest = character.quests.find(
      (cq) => cq.questId === questId && cq.status !== 'completed',
    );

    if (existingQuest) {
      throw new BadRequestException('Этот квест уже взят');
    }

    const completedQuest = character.quests.find(
      (cq) => cq.questId === questId && cq.status === 'completed',
    );

    if (completedQuest && !quest.isRepeatable) {
      throw new BadRequestException('Этот квест уже выполнен и не может быть повторен');
    }

    if (character.level < quest.minLevel) {
      throw new BadRequestException(`Требуется уровень ${quest.minLevel}`);
    }

    if (character.level > quest.maxLevel) {
      throw new BadRequestException(`Ваш уровень слишком высок для этого квеста`);
    }

    if (quest.faction && quest.faction !== character.faction) {
      throw new BadRequestException(`Этот квест доступен только для фракции ${quest.faction}`);
    }

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
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    const characterQuest = await this.characterQuestRepository.findOne({
      where: { id: characterQuestId, characterId },
      relations: ['quest'],
    });

    if (!characterQuest) {
      throw new NotFoundException('Квест не найден');
    }

    if (characterQuest.status !== 'active') {
      throw new BadRequestException('Этот квест не активен');
    }

    if (!this.areQuestObjectivesComplete(characterQuest)) {
      throw new BadRequestException('Не все цели квеста выполнены');
    }

    characterQuest.status = 'completed';
    characterQuest.completedAt = new Date();
    await this.characterQuestRepository.save(characterQuest);

    await this.giveQuestRewards(character, characterQuest.quest);

    return this.getCharacterQuests(characterId, userId);
  }

  /**
   * Отказ от квеста
   */
  async abandonQuest(characterId: number, userId: number, characterQuestId: number) {
    const character = await this.characterRepository.findOne({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new NotFoundException('Персонаж не найден или не принадлежит вам');
    }

    const characterQuest = await this.characterQuestRepository.findOne({
      where: { id: characterQuestId, characterId },
    });

    if (!characterQuest) {
      throw new NotFoundException('Квест не найден');
    }

    if (characterQuest.status !== 'active') {
      throw new BadRequestException('Этот квест не активен');
    }

    await this.characterQuestRepository.remove(characterQuest);

    return this.getCharacterQuests(characterId, userId);
  }

  /**
   * Получение квестов NPC
   */
  async getNpcQuests(npcId: number) {
    const npc = await this.npcRepository.findOne({
      where: { id: npcId },
    });

    if (!npc) {
      throw new NotFoundException('NPC не найден');
    }

    if (!npc.isQuestGiver || !npc.availableQuests || npc.availableQuests.length === 0) {
      return [];
    }

    const quests = await this.questRepository.find({
      where: {
        id: In(npc.availableQuests), // Используем In для массива ID
      },
    });

    return quests;
  }

  /**
   * Инициализация целей квеста
   */
  private initializeQuestObjectives(quest: Quest): Record<string, QuestObjective> {
    // Пример реализации: инициализируем цели на основе структуры квеста
    const objectives: Record<string, QuestObjective> = {};

    // Пример: если квест требует убить 10 гоблинов
    if (quest.id === 1) { // Замените на реальную логику
      objectives['kill_goblins'] = {
        type: 'kill',
        count: 0,
        required: 10,
        target: 'goblin',
      };
    }

    return objectives;
  }

  /**
   * Проверка, выполнены ли все цели квеста
   */
  private areQuestObjectivesComplete(characterQuest: CharacterQuest): boolean {
    const objectives = characterQuest.currentObjectives as Record<string, QuestObjective>;
    for (const objective of Object.values(objectives)) {
      if (objective.count < objective.required) {
        return false;
      }
    }
    return true;
  }

  /**
   * Выдача наград за квест
   */
  private async giveQuestRewards(character: Character, quest: Quest): Promise<void> {
    if (quest.rewardExperience > 0) {
      character.addExperience(quest.rewardExperience);
    }

    if (quest.rewardGold > 0) {
      character.gold += quest.rewardGold;
    }

    if (quest.rewardReputation) {
      for (const [factionName, reputationGain] of Object.entries(quest.rewardReputation as QuestReputation)) {
        const reputation = await this.characterReputationRepository.findOne({
          where: {
            character: { id: character.id },
            faction: { name: factionName },
          },
          relations: ['faction'],
        });

        if (reputation) {
          reputation.reputationValue += reputationGain;
          await this.characterReputationRepository.save(reputation);
        } else {
          const newReputation = this.characterReputationRepository.create({
            character,
            faction: { name: factionName },
            reputationValue: reputationGain,
          });
          await this.characterReputationRepository.save(newReputation);
        }
      }
    }

    await this.characterRepository.save(character);
  }
}