import { BattleType, BattleStatus, BattleParticipant } from './battle.entity';
export declare class BattleLog {
    id: number;
    battleId: string;
    battleType: BattleType;
    result: BattleStatus;
    participants: BattleParticipant[];
    log: string[];
    duration: number;
    createdAt: Date;
}
