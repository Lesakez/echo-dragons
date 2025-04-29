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
exports.Battlefield = void 0;
const typeorm_1 = require("typeorm");
let Battlefield = class Battlefield {
    id;
    name;
    description;
    minLevel;
    maxLevel;
    minPlayersPerTeam;
    maxPlayersPerTeam;
    winConditions;
    rewards;
    mapId;
};
exports.Battlefield = Battlefield;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Battlefield.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Battlefield.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Battlefield.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'min_level' }),
    __metadata("design:type", Number)
], Battlefield.prototype, "minLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100, name: 'max_level' }),
    __metadata("design:type", Number)
], Battlefield.prototype, "maxLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 5, name: 'min_players_per_team' }),
    __metadata("design:type", Number)
], Battlefield.prototype, "minPlayersPerTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10, name: 'max_players_per_team' }),
    __metadata("design:type", Number)
], Battlefield.prototype, "maxPlayersPerTeam", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'win_conditions' }),
    __metadata("design:type", Object)
], Battlefield.prototype, "winConditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Battlefield.prototype, "rewards", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'map_id', length: 50 }),
    __metadata("design:type", String)
], Battlefield.prototype, "mapId", void 0);
exports.Battlefield = Battlefield = __decorate([
    (0, typeorm_1.Entity)('battlefields')
], Battlefield);
//# sourceMappingURL=battlefield.entity.js.map