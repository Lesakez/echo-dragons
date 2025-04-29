import { Repository } from 'typeorm';
import { Character } from '../models/character.entity';
import { Quest } from '../models/quest.entity';
import { CharacterQuest } from '../models/character-quest.entity';
import { Npc } from '../models/npc.entity';
import { CharacterReputation } from '../models/character-reputation.entity';
export declare class QuestsService {
    private characterRepository;
    private questRepository;
    private characterQuestRepository;
    private npcRepository;
    private characterReputationRepository;
    constructor(characterRepository: Repository<Character>, questRepository: Repository<Quest>, characterQuestRepository: Repository<CharacterQuest>, npcRepository: Repository<Npc>, characterReputationRepository: Repository<CharacterReputation>);
    getAllQuests(): Promise<Quest[]>;
    getCharacterQuests(characterId: number, userId: number): Promise<CharacterQuest[]>;
    getAvailableQuests(characterId: number, userId: number): Promise<Quest[]>;
    acceptQuest(characterId: number, userId: number, questId: number): Promise<CharacterQuest[]>;
    completeQuest(characterId: number, userId: number, characterQuestId: number): Promise<CharacterQuest[]>;
    abandonQuest(characterId: number, userId: number, characterQuestId: number): Promise<CharacterQuest[]>;
    getNpcQuests(npcId: number): Promise<Quest[]>;
    private initializeQuestObjectives;
    private areQuestObjectivesComplete;
    private giveQuestRewards;
}
