import { CharacterReputation } from './character-reputation.entity';
export declare class Faction {
    id: number;
    name: string;
    description: string;
    isMajor: boolean;
    parentFactionId: number;
    parentFaction: Faction;
    startingReputation: number;
    hostileTowards: number[];
    characterReputations: CharacterReputation[];
    subFactions: Faction[];
}
