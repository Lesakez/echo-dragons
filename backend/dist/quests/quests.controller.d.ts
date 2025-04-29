import { QuestsService } from './quests.service';
import { Request } from 'express';
export declare class QuestsController {
    private readonly questsService;
    constructor(questsService: QuestsService);
    getAllQuests(): Promise<import("../models/quest.entity").Quest[]>;
    getCharacterQuests(characterId: string, req: Request): Promise<import("../models/character-quest.entity").CharacterQuest[]>;
    getAvailableQuests(characterId: string, req: Request): Promise<import("../models/quest.entity").Quest[]>;
    acceptQuest(characterId: string, body: {
        questId: number;
    }, req: Request): Promise<import("../models/character-quest.entity").CharacterQuest[]>;
    completeQuest(characterId: string, body: {
        characterQuestId: number;
    }, req: Request): Promise<import("../models/character-quest.entity").CharacterQuest[]>;
    abandonQuest(characterId: string, body: {
        characterQuestId: number;
    }, req: Request): Promise<import("../models/character-quest.entity").CharacterQuest[]>;
    getNpcQuests(npcId: string): Promise<import("../models/quest.entity").Quest[]>;
}
