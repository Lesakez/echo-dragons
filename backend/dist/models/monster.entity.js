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
exports.Monster = void 0;
const typeorm_1 = require("typeorm");
const monster_spawn_entity_1 = require("./monster-spawn.entity");
let Monster = class Monster {
    id;
    name;
    monsterType;
    level;
    health;
    mana;
    damageMin;
    damageMax;
    armor;
    magicResistance;
    experienceReward;
    goldRewardMin;
    goldRewardMax;
    aggroRange;
    abilities;
    lootTable;
    respawnTime;
    isElite;
    isBoss;
    spawns;
};
exports.Monster = Monster;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Monster.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Monster.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monster_type', length: 50 }),
    __metadata("design:type", String)
], Monster.prototype, "monsterType", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Monster.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Monster.prototype, "health", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Monster.prototype, "mana", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'damage_min' }),
    __metadata("design:type", Number)
], Monster.prototype, "damageMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'damage_max' }),
    __metadata("design:type", Number)
], Monster.prototype, "damageMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Monster.prototype, "armor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'magic_resistance' }),
    __metadata("design:type", Number)
], Monster.prototype, "magicResistance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'experience_reward' }),
    __metadata("design:type", Number)
], Monster.prototype, "experienceReward", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'gold_reward_min' }),
    __metadata("design:type", Number)
], Monster.prototype, "goldRewardMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'gold_reward_max' }),
    __metadata("design:type", Number)
], Monster.prototype, "goldRewardMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10, name: 'aggro_range' }),
    __metadata("design:type", Number)
], Monster.prototype, "aggroRange", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Monster.prototype, "abilities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'loot_table' }),
    __metadata("design:type", Object)
], Monster.prototype, "lootTable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 300, name: 'respawn_time' }),
    __metadata("design:type", Number)
], Monster.prototype, "respawnTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_elite' }),
    __metadata("design:type", Boolean)
], Monster.prototype, "isElite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_boss' }),
    __metadata("design:type", Boolean)
], Monster.prototype, "isBoss", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => monster_spawn_entity_1.MonsterSpawn, monsterSpawn => monsterSpawn.monster),
    __metadata("design:type", Array)
], Monster.prototype, "spawns", void 0);
exports.Monster = Monster = __decorate([
    (0, typeorm_1.Entity)('monsters')
], Monster);
//# sourceMappingURL=monster.entity.js.map