// src/modules/characters/characters.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../../models/character.entity';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private charactersRepository: Repository<Character>,
  ) {}

  async create(userId: number, createCharacterDto: CreateCharacterDto): Promise<Character> {
    const character = this.charactersRepository.create({
      ...createCharacterDto,
      userId,
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
      where: { userId }
    });
  }

  async findOne(id: number, userId: number): Promise<Character> {
    const character = await this.charactersRepository.findOne({
      where: { id },
      relations: ['inventorySlots', 'skills', 'quests', 'reputations']
    });

    if (!character) {
      throw new NotFoundException(`Персонаж с ID ${id} не найден`);
    }

    // Проверка владения персонажем
    if (character.userId !== userId) {
      throw new ForbiddenException('У вас нет доступа к этому персонажу');
    }

    return character;
  }

  async update(id: number, userId: number, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
    const character = await this.findOne(id, userId);

    // Обновляем только разрешенные поля
    // Нельзя обновить уровень, опыт и другие важные характеристики напрямую
    const allowedFields = ['name']; // Добавьте другие разрешенные поля по необходимости

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