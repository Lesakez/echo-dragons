import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character, Faction, CharacterClass } from '../../models/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { User } from '../../models/user.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async create(user: User, createCharacterDto: CreateCharacterDto): Promise<Character> {
    const character = this.charactersRepository.create({
      ...createCharacterDto,
      user, // Передаем объект user вместо userId
      faction: createCharacterDto.faction as Faction, // Явное приведение к Faction
      class: createCharacterDto.class as CharacterClass, // Явное приведение к CharacterClass
      level: 1,
      experience: 0,
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      strength: 10,
      dexterity: 10,
      intuition: 10,
      endurance: 10,
      intelligence: 10,
      wisdom: 10,
      availableStatPoints: 0,
      availableSkillPoints: 0,
      gold: 100,
    });

    return this.charactersRepository.save(character);
  }

  async findAllByUser(userId: number): Promise<Character[]> {
    return this.charactersRepository.find({
      where: { userId },
    });
  }

  async findOne(id: number, userId: number): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['inventorySlots', 'skills', 'quests', 'reputations'],
    });

    if (!character) {
      throw new NotFoundException(`Персонаж с ID ${id} не найден`);
    }

    if (character.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому персонажу');
    }

    return character;
  }

  async update(id: number, userId: number, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    const character = await this.findOne(id, userId);

    const allowedFields = ['name'];
    for (const field of allowedFields) {
      if (updateCharacterDto[field] !== undefined) {
        character[field] = updateCharacterDto[field];
      }
    }

    return this.charactersRepository.save(character);
  }

  async remove(id: number, userId: number): Promise<void> {
    const character = await this.findOne(id, userId);
    await this.charactersRepository.remove(character);
  }
}