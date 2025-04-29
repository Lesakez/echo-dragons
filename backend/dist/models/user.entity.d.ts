import { Character } from './character.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    characters: Character[];
}
