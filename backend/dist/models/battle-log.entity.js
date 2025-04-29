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
exports.BattleLog = void 0;
const typeorm_1 = require("typeorm");
const battle_entity_1 = require("./battle.entity");
let BattleLog = class BattleLog {
    id;
    battleId;
    battleType;
    result;
    participants;
    log;
    duration;
    createdAt;
};
exports.BattleLog = BattleLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BattleLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'battle_id' }),
    __metadata("design:type", String)
], BattleLog.prototype, "battleId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: battle_entity_1.BattleType,
        name: 'battle_type',
    }),
    __metadata("design:type", String)
], BattleLog.prototype, "battleType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: battle_entity_1.BattleStatus,
        name: 'result',
    }),
    __metadata("design:type", String)
], BattleLog.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'participants' }),
    __metadata("design:type", Array)
], BattleLog.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'log', default: [] }),
    __metadata("design:type", Array)
], BattleLog.prototype, "log", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'duration' }),
    __metadata("design:type", Number)
], BattleLog.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], BattleLog.prototype, "createdAt", void 0);
exports.BattleLog = BattleLog = __decorate([
    (0, typeorm_1.Entity)('battle_logs')
], BattleLog);
//# sourceMappingURL=battle-log.entity.js.map