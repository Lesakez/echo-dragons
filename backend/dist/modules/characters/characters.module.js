"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharactersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const characters_controller_1 = require("./characters.controller");
const characters_service_1 = require("./characters.service");
const character_entity_1 = require("../../models/character.entity");
const inventory_slot_entity_1 = require("../../models/inventory-slot.entity");
const character_skill_entity_1 = require("../../models/character-skill.entity");
const character_quest_entity_1 = require("../../models/character-quest.entity");
const character_reputation_entity_1 = require("../../models/character-reputation.entity");
let CharactersModule = class CharactersModule {
};
exports.CharactersModule = CharactersModule;
exports.CharactersModule = CharactersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                character_entity_1.Character,
                inventory_slot_entity_1.InventorySlot,
                character_skill_entity_1.CharacterSkill,
                character_quest_entity_1.CharacterQuest,
                character_reputation_entity_1.CharacterReputation
            ])
        ],
        controllers: [characters_controller_1.CharactersController],
        providers: [characters_service_1.CharactersService],
        exports: [characters_service_1.CharactersService],
    })
], CharactersModule);
//# sourceMappingURL=characters.module.js.map