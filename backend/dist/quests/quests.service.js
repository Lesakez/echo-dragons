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
exports.QuestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("../models/character.entity");
const quest_entity_1 = require("../models/quest.entity");
const character_quest_entity_1 = require("../models/character-quest.entity");
const npc_entity_1 = require("../models/npc.entity");
const character_reputation_entity_1 = require("../models/character-reputation.entity");
let QuestsService = class QuestsService {
    characterRepository;
    questRepository;
    characterQuestRepository;
    npcRepository;
    characterReputationRepository;
    constructor(characterRepository, questRepository, characterQuestRepository, npcRepository, characterReputationRepository) {
        this.characterRepository = characterRepository;
        this.questRepository = questRepository;
        this.characterQuestRepository = characterQuestRepository;
        this.npcRepository = npcRepository;
        this.characterReputationRepository = characterReputationRepository;
    }
    async getAllQuests() {
        return this.questRepository.find();
    }
    async getCharacterQuests(characterId, userId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId },
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const characterQuests = await this.characterQuestRepository.find({
            where: { characterId },
            relations: ['quest'],
        });
        return characterQuests;
    }
    async getAvailableQuests(characterId, userId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId },
            relations: ['reputations', 'reputations.faction', 'quests', 'quests.quest'],
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const allQuests = await this.questRepository.find();
        const availableQuests = allQuests.filter((quest) => {
            const isQuestActive = character.quests.some((cq) => cq.questId === quest.id && cq.status !== 'completed');
            if (isQuestActive) {
                return false;
            }
            const isQuestCompleted = character.quests.some((cq) => cq.questId === quest.id && cq.status === 'completed');
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
                for (const [factionName, requiredValue] of Object.entries(quest.requiredReputation)) {
                    const reputation = character.reputations.find((r) => r.faction.name === factionName);
                    if (!reputation || reputation.reputationValue < requiredValue) {
                        return false;
                    }
                }
            }
            if (quest.prerequisites && quest.prerequisites.length > 0) {
                for (const prereqId of quest.prerequisites) {
                    const prereqCompleted = character.quests.some((cq) => cq.questId === prereqId && cq.status === 'completed');
                    if (!prereqCompleted) {
                        return false;
                    }
                }
            }
            return true;
        });
        return availableQuests;
    }
    async acceptQuest(characterId, userId, questId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId },
            relations: ['quests', 'quests.quest'],
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const quest = await this.questRepository.findOne({
            where: { id: questId },
        });
        if (!quest) {
            throw new common_1.NotFoundException('Квест не найден');
        }
        const existingQuest = character.quests.find((cq) => cq.questId === questId && cq.status !== 'completed');
        if (existingQuest) {
            throw new common_1.BadRequestException('Этот квест уже взят');
        }
        const completedQuest = character.quests.find((cq) => cq.questId === questId && cq.status === 'completed');
        if (completedQuest && !quest.isRepeatable) {
            throw new common_1.BadRequestException('Этот квест уже выполнен и не может быть повторен');
        }
        if (character.level < quest.minLevel) {
            throw new common_1.BadRequestException(`Требуется уровень ${quest.minLevel}`);
        }
        if (character.level > quest.maxLevel) {
            throw new common_1.BadRequestException(`Ваш уровень слишком высок для этого квеста`);
        }
        if (quest.faction && quest.faction !== character.faction) {
            throw new common_1.BadRequestException(`Этот квест доступен только для фракции ${quest.faction}`);
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
    async completeQuest(characterId, userId, characterQuestId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId },
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const characterQuest = await this.characterQuestRepository.findOne({
            where: { id: characterQuestId, characterId },
            relations: ['quest'],
        });
        if (!characterQuest) {
            throw new common_1.NotFoundException('Квест не найден');
        }
        if (characterQuest.status !== 'active') {
            throw new common_1.BadRequestException('Этот квест не активен');
        }
        if (!this.areQuestObjectivesComplete(characterQuest)) {
            throw new common_1.BadRequestException('Не все цели квеста выполнены');
        }
        characterQuest.status = 'completed';
        characterQuest.completedAt = new Date();
        await this.characterQuestRepository.save(characterQuest);
        await this.giveQuestRewards(character, characterQuest.quest);
        return this.getCharacterQuests(characterId, userId);
    }
    async abandonQuest(characterId, userId, characterQuestId) {
        const character = await this.characterRepository.findOne({
            where: { id: characterId, userId },
        });
        if (!character) {
            throw new common_1.NotFoundException('Персонаж не найден или не принадлежит вам');
        }
        const characterQuest = await this.characterQuestRepository.findOne({
            where: { id: characterQuestId, characterId },
        });
        if (!characterQuest) {
            throw new common_1.NotFoundException('Квест не найден');
        }
        if (characterQuest.status !== 'active') {
            throw new common_1.BadRequestException('Этот квест не активен');
        }
        await this.characterQuestRepository.remove(characterQuest);
        return this.getCharacterQuests(characterId, userId);
    }
    async getNpcQuests(npcId) {
        const npc = await this.npcRepository.findOne({
            where: { id: npcId },
        });
        if (!npc) {
            throw new common_1.NotFoundException('NPC не найден');
        }
        if (!npc.isQuestGiver || !npc.availableQuests || npc.availableQuests.length === 0) {
            return [];
        }
        const quests = await this.questRepository.find({
            where: {
                id: (0, typeorm_2.In)(npc.availableQuests),
            },
        });
        return quests;
    }
    initializeQuestObjectives(quest) {
        const objectives = {};
        if (quest.id === 1) {
            objectives['kill_goblins'] = {
                type: 'kill',
                count: 0,
                required: 10,
                target: 'goblin',
            };
        }
        return objectives;
    }
    areQuestObjectivesComplete(characterQuest) {
        const objectives = characterQuest.currentObjectives;
        for (const objective of Object.values(objectives)) {
            if (objective.count < objective.required) {
                return false;
            }
        }
        return true;
    }
    async giveQuestRewards(character, quest) {
        if (quest.rewardExperience > 0) {
            character.addExperience(quest.rewardExperience);
        }
        if (quest.rewardGold > 0) {
            character.gold += quest.rewardGold;
        }
        if (quest.rewardReputation) {
            for (const [factionName, reputationGain] of Object.entries(quest.rewardReputation)) {
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
                }
                else {
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
};
exports.QuestsService = QuestsService;
exports.QuestsService = QuestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __param(1, (0, typeorm_1.InjectRepository)(quest_entity_1.Quest)),
    __param(2, (0, typeorm_1.InjectRepository)(character_quest_entity_1.CharacterQuest)),
    __param(3, (0, typeorm_1.InjectRepository)(npc_entity_1.Npc)),
    __param(4, (0, typeorm_1.InjectRepository)(character_reputation_entity_1.CharacterReputation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], QuestsService);
//# sourceMappingURL=quests.service.js.map