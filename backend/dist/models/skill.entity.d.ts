export declare class Skill {
    id: number;
    name: string;
    description: string;
    skillType: string;
    classRequirement: string;
    factionRequirement: string;
    levelRequirement: number;
    manaCost: number;
    rageCost: number;
    energyCost: number;
    cooldownSeconds: number;
    baseDamage: number;
    baseHealing: number;
    effects: Record<string, any>;
    iconPath: string;
}
