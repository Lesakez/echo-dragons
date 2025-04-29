import { User } from './user.entity';
import { InventorySlot } from './inventory-slot.entity';
import { CharacterSkill } from './character-skill.entity';
import { CharacterQuest } from './character-quest.entity';
import { CharacterReputation } from './character-reputation.entity';
import { GuildMember } from './guild-member.entity';
export declare enum Faction {
    AVRELIA = "avrelia",
    INFERNO = "inferno"
}
export declare enum CharacterClass {
    WARRIOR = "warrior",
    MAGE = "mage",
    ROGUE = "rogue",
    PRIEST = "priest"
}
export declare class Character {
    id: number;
    userId: number;
    user: User;
    name: string;
    faction: Faction;
    class: CharacterClass;
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    strength: number;
    dexterity: number;
    intuition: number;
    endurance: number;
    intelligence: number;
    wisdom: number;
    availableStatPoints: number;
    availableSkillPoints: number;
    xPosition: number;
    yPosition: number;
    currentMap: string;
    gold: number;
    createdAt: Date;
    updatedAt: Date;
    inventorySlots: InventorySlot[];
    skills: CharacterSkill[];
    quests: CharacterQuest[];
    reputations: CharacterReputation[];
    guildMember: GuildMember;
    getDamage(): {
        min: number;
        max: number;
    };
    getDefense(): number;
    getMagicResistance(): number;
    getCriticalChance(): number;
    getEvasionChance(): number;
    getExpForNextLevel(): number;
    addExperience(amount: number): {
        leveledUp: boolean;
        newLevel?: number;
    };
}
