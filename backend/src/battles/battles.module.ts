// src/battles/battles.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BattlesController } from './battles.controller';
import { BattlesService } from './battles.service';
import { Character } from '../models/character.entity';
import { Monster } from '../models/monster.entity';
import { Item } from '../models/item.entity';
import { Skill } from '../models/skill.entity';
import { BattleLog } from '../models/battle-log.entity';
import { Battle } from '../models/battle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      Monster,
      Item,
      Skill,
      BattleLog,
      Battle
    ])
  ],
  controllers: [BattlesController],
  providers: [BattlesService],
  exports: [BattlesService],
})
export class BattlesModule {}