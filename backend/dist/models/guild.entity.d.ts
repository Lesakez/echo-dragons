import { Character } from './character.entity';
import { GuildMember } from './guild-member.entity';
export declare class Guild {
    id: number;
    name: string;
    faction: string;
    leaderId: number;
    leader: Character;
    description: string;
    emblem: string;
    createdAt: Date;
    level: number;
    experience: number;
    gold: number;
    members: GuildMember[];
}
