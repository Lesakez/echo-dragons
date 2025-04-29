export declare enum BattleType {
    PVE = "pve",
    PVP = "pvp",
    GUILD = "guild"
}
export declare enum BattleStatus {
    ACTIVE = "active",
    VICTORY = "victory",
    DEFEAT = "defeat",
    DRAW = "draw"
}
export interface BattleParticipant {
    id: number;
    type: 'character' | 'monster';
    entityId: number;
    name: string;
    team: number;
}
export declare class Battle {
    id: number;
    type: BattleType;
    status: BattleStatus;
    turn: number;
    participants: BattleParticipant[];
    logs: string[];
    startedAt: Date;
    lastActionTime: Date;
    endedAt: Date;
}
