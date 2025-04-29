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
exports.CharacterReputation = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const faction_entity_1 = require("./faction.entity");
let CharacterReputation = class CharacterReputation {
    id;
    characterId;
    character;
    factionId;
    faction;
    reputationValue;
};
exports.CharacterReputation = CharacterReputation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterReputation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'character_id' }),
    __metadata("design:type", Number)
], CharacterReputation.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, character => character.reputations),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterReputation.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'faction_id' }),
    __metadata("design:type", Number)
], CharacterReputation.prototype, "factionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => faction_entity_1.Faction, faction => faction.characterReputations),
    (0, typeorm_1.JoinColumn)({ name: 'faction_id' }),
    __metadata("design:type", faction_entity_1.Faction)
], CharacterReputation.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'reputation_value' }),
    __metadata("design:type", Number)
], CharacterReputation.prototype, "reputationValue", void 0);
exports.CharacterReputation = CharacterReputation = __decorate([
    (0, typeorm_1.Entity)('character_reputation')
], CharacterReputation);
//# sourceMappingURL=character-reputation.entity.js.map