import { Monster } from './monster.entity';
export declare class MonsterSpawn {
    id: number;
    monsterId: number;
    monster: Monster;
    xPosition: number;
    yPosition: number;
    mapId: string;
    spawnGroup: number;
    respawnTimer: Date;
}
