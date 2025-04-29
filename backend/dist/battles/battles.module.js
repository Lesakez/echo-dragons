"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattlesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const battles_controller_1 = require("./battles.controller");
const battles_service_1 = require("./battles.service");
const character_entity_1 = require("../models/character.entity");
const monster_entity_1 = require("../models/monster.entity");
const item_entity_1 = require("../models/item.entity");
const skill_entity_1 = require("../models/skill.entity");
const battle_log_entity_1 = require("../models/battle-log.entity");
const battle_entity_1 = require("../models/battle.entity");
let BattlesModule = class BattlesModule {
};
exports.BattlesModule = BattlesModule;
exports.BattlesModule = BattlesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                character_entity_1.Character,
                monster_entity_1.Monster,
                item_entity_1.Item,
                skill_entity_1.Skill,
                battle_log_entity_1.BattleLog,
                battle_entity_1.Battle
            ])
        ],
        controllers: [battles_controller_1.BattlesController],
        providers: [battles_service_1.BattlesService],
        exports: [battles_service_1.BattlesService],
    })
], BattlesModule);
//# sourceMappingURL=battles.module.js.map