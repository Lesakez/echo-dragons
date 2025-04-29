import { MonsterSpawn } from './monster-spawn.entity';
export declare class Monster {
    id: number;
    name: string;
    monsterType: string;
    level: number;
    health: number;
    mana: number;
    damageMin: number;
    damageMax: number;
    armor: number;
    magicResistance: number;
    experienceReward: number;
    goldRewardMin: number;
    goldRewardMax: number;
    aggroRange: number;
    abilities: Record<string, any>;
    lootTable: Record<string, any>;
    respawnTime: number;
    isElite: boolean;
    isBoss: boolean;
    spawns: MonsterSpawn[];
}
