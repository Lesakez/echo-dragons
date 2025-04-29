import { Character } from './character.entity';
import { Guild } from './guild.entity';
export declare class GuildMember {
    id: number;
    guildId: number;
    guild: Guild;
    characterId: number;
    character: Character;
    rank: string;
    joinedAt: Date;
}
