export declare class Battlefield {
    id: number;
    name: string;
    description: string;
    minLevel: number;
    maxLevel: number;
    minPlayersPerTeam: number;
    maxPlayersPerTeam: number;
    winConditions: Record<string, any>;
    rewards: Record<string, any>;
    mapId: string;
}
