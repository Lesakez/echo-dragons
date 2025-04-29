"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("./models/user.entity");
const character_entity_1 = require("./models/character.entity");
const inventory_slot_entity_1 = require("./models/inventory-slot.entity");
const item_entity_1 = require("./models/item.entity");
const item_modification_entity_1 = require("./models/item-modification.entity");
const skill_entity_1 = require("./models/skill.entity");
const character_skill_entity_1 = require("./models/character-skill.entity");
const quest_entity_1 = require("./models/quest.entity");
const character_quest_entity_1 = require("./models/character-quest.entity");
const npc_entity_1 = require("./models/npc.entity");
const monster_entity_1 = require("./models/monster.entity");
const monster_spawn_entity_1 = require("./models/monster-spawn.entity");
const faction_entity_1 = require("./models/faction.entity");
const character_reputation_entity_1 = require("./models/character-reputation.entity");
const guild_entity_1 = require("./models/guild.entity");
const guild_member_entity_1 = require("./models/guild-member.entity");
const battlefield_entity_1 = require("./models/battlefield.entity");
const battle_entity_1 = require("./models/battle.entity");
const battle_log_entity_1 = require("./models/battle-log.entity");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const characters_module_1 = require("./modules/characters/characters.module");
const battles_module_1 = require("./battles/battles.module");
const chat_module_1 = require("./chat/chat.module");
const inventory_module_1 = require("./inventory/inventory.module");
const quests_module_1 = require("./quests/quests.module");
const redis_modules_1 = require("./shared/redis/redis.modules");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const config = {
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'postgres'),
                        password: configService.get('DB_PASSWORD'),
                        database: configService.get('DB_DATABASE', 'echo_dragons'),
                        entities: [
                            user_entity_1.User,
                            character_entity_1.Character,
                            inventory_slot_entity_1.InventorySlot,
                            item_entity_1.Item,
                            item_modification_entity_1.ItemModification,
                            skill_entity_1.Skill,
                            character_skill_entity_1.CharacterSkill,
                            quest_entity_1.Quest,
                            character_quest_entity_1.CharacterQuest,
                            npc_entity_1.Npc,
                            monster_entity_1.Monster,
                            monster_spawn_entity_1.MonsterSpawn,
                            faction_entity_1.Faction,
                            character_reputation_entity_1.CharacterReputation,
                            guild_entity_1.Guild,
                            guild_member_entity_1.GuildMember,
                            battlefield_entity_1.Battlefield,
                            battle_entity_1.Battle,
                            battle_log_entity_1.BattleLog,
                        ],
                        synchronize: configService.get('DB_SYNC', false),
                        logging: configService.get('DB_LOGGING', false),
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
            redis_modules_1.RedisModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            characters_module_1.CharactersModule,
            battles_module_1.BattlesModule,
            chat_module_1.ChatModule,
            inventory_module_1.InventoryModule,
            quests_module_1.QuestsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map