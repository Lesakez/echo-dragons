import { Character } from './character.entity';
import { Quest } from './quest.entity';
export declare class CharacterQuest {
    id: number;
    characterId: number;
    character: Character;
    questId: number;
    quest: Quest;
    status: string;
    currentObjectives: Record<string, any>;
    completedAt: Date;
}
