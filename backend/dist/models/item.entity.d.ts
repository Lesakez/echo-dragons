export declare class Item {
    id: number;
    name: string;
    type: string;
    subtype: string;
    rarity: string;
    levelRequirement: number;
    classRequirement: string;
    factionRequirement: string;
    stackable: boolean;
    sellable: boolean;
    tradeable: boolean;
    basePrice: number;
    description: string;
    attributes: Record<string, any>;
    iconPath: string;
}
