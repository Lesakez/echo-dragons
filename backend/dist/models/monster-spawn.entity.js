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
exports.MonsterSpawn = void 0;
const typeorm_1 = require("typeorm");
const monster_entity_1 = require("./monster.entity");
let MonsterSpawn = class MonsterSpawn {
    id;
    monsterId;
    monster;
    xPosition;
    yPosition;
    mapId;
    spawnGroup;
    respawnTimer;
};
exports.MonsterSpawn = MonsterSpawn;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MonsterSpawn.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'monster_id' }),
    __metadata("design:type", Number)
], MonsterSpawn.prototype, "monsterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => monster_entity_1.Monster, monster => monster.spawns),
    (0, typeorm_1.JoinColumn)({ name: 'monster_id' }),
    __metadata("design:type", monster_entity_1.Monster)
], MonsterSpawn.prototype, "monster", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'x_position' }),
    __metadata("design:type", Number)
], MonsterSpawn.prototype, "xPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'y_position' }),
    __metadata("design:type", Number)
], MonsterSpawn.prototype, "yPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'map_id', length: 50 }),
    __metadata("design:type", String)
], MonsterSpawn.prototype, "mapId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'spawn_group' }),
    __metadata("design:type", Number)
], MonsterSpawn.prototype, "spawnGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true, name: 'respawn_timer' }),
    __metadata("design:type", Date)
], MonsterSpawn.prototype, "respawnTimer", void 0);
exports.MonsterSpawn = MonsterSpawn = __decorate([
    (0, typeorm_1.Entity)('monster_spawns')
], MonsterSpawn);
//# sourceMappingURL=monster-spawn.entity.js.map