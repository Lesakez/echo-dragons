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
exports.CharacterSkill = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const skill_entity_1 = require("./skill.entity");
let CharacterSkill = class CharacterSkill {
    id;
    characterId;
    character;
    skillId;
    skill;
    level;
    experience;
    cooldownUntil;
};
exports.CharacterSkill = CharacterSkill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CharacterSkill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'character_id' }),
    __metadata("design:type", Number)
], CharacterSkill.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, character => character.skills),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], CharacterSkill.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skill_id' }),
    __metadata("design:type", Number)
], CharacterSkill.prototype, "skillId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => skill_entity_1.Skill),
    (0, typeorm_1.JoinColumn)({ name: 'skill_id' }),
    __metadata("design:type", skill_entity_1.Skill)
], CharacterSkill.prototype, "skill", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], CharacterSkill.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], CharacterSkill.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true, name: 'cooldown_until' }),
    __metadata("design:type", Date)
], CharacterSkill.prototype, "cooldownUntil", void 0);
exports.CharacterSkill = CharacterSkill = __decorate([
    (0, typeorm_1.Entity)('character_skills')
], CharacterSkill);
//# sourceMappingURL=character-skill.entity.js.map