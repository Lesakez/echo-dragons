"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterQuest = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const quest_entity_1 = require("./quest.entity");
let CharacterQuest = class CharacterQuest {
    id;
    characterId;
    character;
    questId;
    quest;
    status;
    currentObjectives;
    completedAt;
};
exports.CharacterQuest = CharacterQuest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterQuest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'character_id' }),
    __metadata("design:type", Number)
], CharacterQuest.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, character => character.quests),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterQuest.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quest_id' }),
    __metadata("design:type", Number)
], CharacterQuest.prototype, "questId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quest_entity_1.Quest),
    (0, typeorm_1.JoinColumn)({ name: 'quest_id' }),
    __metadata("design:type", quest_entity_1.Quest)
], CharacterQuest.prototype, "quest", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], CharacterQuest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'current_objectives' }),
    __metadata("design:type", Object)
], CharacterQuest.prototype, "currentObjectives", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true, name: 'completed_at' }),
    __metadata("design:type", Date)
], CharacterQuest.prototype, "completedAt", void 0);
exports.CharacterQuest = CharacterQuest = __decorate([
    (0, typeorm_1.Entity)('character_quests')
], CharacterQuest);
//# sourceMappingURL=character-quest.entity.js.map