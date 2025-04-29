import { Character } from './character.entity';
import { Skill } from './skill.entity';
export declare class CharacterSkill {
    id: number;
    characterId: number;
    character: Character;
    skillId: number;
    skill: Skill;
    level: number;
    experience: number;
    cooldownUntil: Date;
}
