export declare class Npc {
    id: number;
    name: string;
    faction: string;
    isMerchant: boolean;
    isQuestGiver: boolean;
    isTrainer: boolean;
    xPosition: number;
    yPosition: number;
    mapId: string;
    dialogue: Record<string, any>;
    availableQuests: number[];
    inventory: Record<string, any>;
}
