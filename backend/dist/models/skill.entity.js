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
exports.Skill = void 0;
const typeorm_1 = require("typeorm");
let Skill = class Skill {
    id;
    name;
    description;
    skillType;
    classRequirement;
    factionRequirement;
    levelRequirement;
    manaCost;
    rageCost;
    energyCost;
    cooldownSeconds;
    baseDamage;
    baseHealing;
    effects;
    iconPath;
};
exports.Skill = Skill;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Skill.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'skill_type', length: 50 }),
    __metadata("design:type", String)
], Skill.prototype, "skillType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'class_requirement', length: 50, nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "classRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'faction_requirement', length: 20, nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "factionRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'level_requirement' }),
    __metadata("design:type", Number)
], Skill.prototype, "levelRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'mana_cost' }),
    __metadata("design:type", Number)
], Skill.prototype, "manaCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'rage_cost' }),
    __metadata("design:type", Number)
], Skill.prototype, "rageCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'energy_cost' }),
    __metadata("design:type", Number)
], Skill.prototype, "energyCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'cooldown_seconds' }),
    __metadata("design:type", Number)
], Skill.prototype, "cooldownSeconds", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'base_damage' }),
    __metadata("design:type", Number)
], Skill.prototype, "baseDamage", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'base_healing' }),
    __metadata("design:type", Number)
], Skill.prototype, "baseHealing", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Skill.prototype, "effects", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'icon_path', nullable: true }),
    __metadata("design:type", String)
], Skill.prototype, "iconPath", void 0);
exports.Skill = Skill = __decorate([
    (0, typeorm_1.Entity)('skills')
], Skill);
//# sourceMappingURL=skill.entity.js.map