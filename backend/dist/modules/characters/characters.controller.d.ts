import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { Request } from 'express';
export declare class CharactersController {
    private readonly charactersService;
    constructor(charactersService: CharactersService);
    create(createCharacterDto: CreateCharacterDto, req: Request): Promise<import("../../models/character.entity").Character>;
    findAll(req: Request): Promise<import("../../models/character.entity").Character[]>;
    findOne(id: string, req: Request): Promise<import("../../models/character.entity").Character>;
    update(id: string, updateCharacterDto: UpdateCharacterDto, req: Request): Promise<import("../../models/character.entity").Character>;
    remove(id: string, req: Request): Promise<void>;
}
