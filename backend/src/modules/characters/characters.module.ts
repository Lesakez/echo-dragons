// src/modules/characters/characters.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Character } from '../../models/character.entity';
import { InventorySlot } from '../../models/inventory-slot.entity';
import { CharacterSkill } from '../../models/character-skill.entity';
import { CharacterQuest } from '../../models/character-quest.entity';
import { CharacterReputation } from '../../models/character-reputation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      InventorySlot,
      CharacterSkill,
      CharacterQuest,
      CharacterReputation
    ])
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService],
})
export class CharactersModule {}