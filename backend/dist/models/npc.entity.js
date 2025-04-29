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
exports.Npc = void 0;
const typeorm_1 = require("typeorm");
let Npc = class Npc {
    id;
    name;
    faction;
    isMerchant;
    isQuestGiver;
    isTrainer;
    xPosition;
    yPosition;
    mapId;
    dialogue;
    availableQuests;
    inventory;
};
exports.Npc = Npc;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Npc.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Npc.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Npc.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_merchant' }),
    __metadata("design:type", Boolean)
], Npc.prototype, "isMerchant", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_quest_giver' }),
    __metadata("design:type", Boolean)
], Npc.prototype, "isQuestGiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_trainer' }),
    __metadata("design:type", Boolean)
], Npc.prototype, "isTrainer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'x_position' }),
    __metadata("design:type", Number)
], Npc.prototype, "xPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'y_position' }),
    __metadata("design:type", Number)
], Npc.prototype, "yPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'map_id', length: 50 }),
    __metadata("design:type", String)
], Npc.prototype, "mapId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Npc.prototype, "dialogue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'available_quests' }),
    __metadata("design:type", Array)
], Npc.prototype, "availableQuests", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Npc.prototype, "inventory", void 0);
exports.Npc = Npc = __decorate([
    (0, typeorm_1.Entity)('npcs')
], Npc);
//# sourceMappingURL=npc.entity.js.map