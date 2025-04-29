import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const config: TypeOrmModuleOptions = {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE', 'echo_dragons'),
          entities: [
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
          synchronize: configService.get<boolean>('DB_SYNC', false),
          logging: configService.get<boolean>('DB_LOGGING', false),
          retryAttempts: 5,
          retryDelay: 3000,
        };
        console.log('TypeORM Config:', {
          host: config.host,
          port: config.port,
          username: config.username,
          database: config.database,
        });
        return config;
      },
    }),
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