import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestsController } from './quests.controller';
import { QuestsService } from './quests.service';
import { Character } from '../models/character.entity';
import { Quest } from '../models/quest.entity';
import { CharacterQuest } from '../models/character-quest.entity';
import { Npc } from '../models/npc.entity';
import { CharacterReputation } from '../models/character-reputation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      Quest,
      CharacterQuest,
      Npc,
      CharacterReputation
    ])
  ],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}