import { Character } from './character.entity';
import { Faction } from './faction.entity';
export declare class CharacterReputation {
    id: number;
    characterId: number;
    character: Character;
    factionId: number;
    faction: Faction;
    reputationValue: number;
}
