import { BattlesService } from './battles.service';
import { Request } from 'express';
import { BattleState, BattleAction } from './interfaces/battle.interfaces';
export declare class BattlesController {
    private readonly battlesService;
    constructor(battlesService: BattlesService);
    createPvEBattle(body: {
        characterId: number;
        monsterIds: number[];
    }, req: Request): Promise<BattleState>;
    createPvPBattle(body: {
        characterIds: number[];
    }, req: Request): Promise<BattleState>;
    performAction(battleId: string, body: {
        participantId: number;
        action: BattleAction;
    }, req: Request): Promise<BattleState>;
}
