import { Repository } from 'typeorm';
import { Character } from '../../models/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
export declare class CharactersService {
    private charactersRepository;
    constructor(charactersRepository: Repository<Character>);
    create(userId: number, createCharacterDto: CreateCharacterDto): Promise<Character>;
    findAllByUser(userId: number): Promise<Character[]>;
    findOne(id: number, userId: number): Promise<Character>;
    update(id: number, userId: number, updateCharacterDto: UpdateCharacterDto): Promise<Character>;
    remove(id: number, userId: number): Promise<void>;
}
