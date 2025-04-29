// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Импорт всех entity-моделей
import { User } from './models/user.entity';
import { Character } from './models/character.entity';
import { InventorySlot } from './models/inventory-slot.entity';
import { Item } from './models/item.entity';
import { ItemModification } from './models/item-modification.entity';
import { Skill } from './models/skill.entity';
import { CharacterSkill } from './models/character-skill.entity';
import { Quest } from './models/quest.entity';
import { CharacterQuest } from './models/character-quest.entity';
import { Npc } from './models/npc.entity';
import { Monster } from './models/monster.entity';
import { MonsterSpawn } from './models/monster-spawn.entity';
import { Faction } from './models/faction.entity';
import { CharacterReputation } from './models/character-reputation.entity';
import { Guild } from './models/guild.entity';
import { GuildMember } from './models/guild-member.entity';
import { Battlefield } from './models/battlefield.entity';
import { Battle } from './models/battle.entity';
import { BattleLog } from './models/battle-log.entity';

// Импорт модулей
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CharactersModule } from './modules/characters/characters.module';
import { BattlesModule } from './battles/battles.module';
import { ChatModule } from './chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';
import { QuestsModule } from './quests/quests.module';
import { RedisModule } from './shared/redis/redis.modules';

@Module({
  imports: [
    // Загрузка конфигурации из .env файла
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Конфигурация TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'echo_dragons'),
        entities: [
          // Регистрация всех entity-моделей
          User,
          Character,
          InventorySlot,
          Item,
          ItemModification,
          Skill,
          CharacterSkill,
          Quest,
          CharacterQuest,
          Npc,
          Monster,
          MonsterSpawn,
          Faction,
          CharacterReputation,
          Guild,
          GuildMember,
          Battlefield,
          Battle,
          BattleLog,
        ],
        // Синхронизация схемы базы данных с entity (только для разработки)
        synchronize: configService.get<boolean>('DB_SYNC', false),
        // Логгирование SQL запросов (только для отладки)
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
    }),
    
    // Регистрация модулей приложения
    RedisModule,
    AuthModule,
    UsersModule,
    CharactersModule,
    BattlesModule,
    ChatModule,
    InventoryModule,
    QuestsModule,
  ],
})
export class AppModule {}