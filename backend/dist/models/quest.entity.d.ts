export declare class Quest {
    id: number;
    name: string;
    description: string;
    faction: string;
    minLevel: number;
    maxLevel: number;
    isRepeatable: boolean;
    isDaily: boolean;
    isWeekly: boolean;
    isMainStory: boolean;
    prerequisites: number[];
    requiredReputation: Record<string, any>;
    rewardExperience: number;
    rewardGold: number;
    rewardItems: {
        itemId: number;
        quantity: number;
        chance: number;
    }[];
    rewardReputation: Record<string, number>;
    iconPath: string;
}
