"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const quests_controller_1 = require("./quests.controller");
const quests_service_1 = require("./quests.service");
const character_entity_1 = require("../models/character.entity");
const quest_entity_1 = require("../models/quest.entity");
const character_quest_entity_1 = require("../models/character-quest.entity");
const npc_entity_1 = require("../models/npc.entity");
const character_reputation_entity_1 = require("../models/character-reputation.entity");
let QuestsModule = class QuestsModule {
};
exports.QuestsModule = QuestsModule;
exports.QuestsModule = QuestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                character_entity_1.Character,
                quest_entity_1.Quest,
                character_quest_entity_1.CharacterQuest,
                npc_entity_1.Npc,
                character_reputation_entity_1.CharacterReputation
            ])
        ],
        controllers: [quests_controller_1.QuestsController],
        providers: [quests_service_1.QuestsService],
        exports: [quests_service_1.QuestsService],
    })
], QuestsModule);
//# sourceMappingURL=quests.module.js.map