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
exports.Battle = exports.BattleStatus = exports.BattleType = void 0;
const typeorm_1 = require("typeorm");
var BattleType;
(function (BattleType) {
    BattleType["PVE"] = "pve";
    BattleType["PVP"] = "pvp";
    BattleType["GUILD"] = "guild";
})(BattleType || (exports.BattleType = BattleType = {}));
var BattleStatus;
(function (BattleStatus) {
    BattleStatus["ACTIVE"] = "active";
    BattleStatus["VICTORY"] = "victory";
    BattleStatus["DEFEAT"] = "defeat";
    BattleStatus["DRAW"] = "draw";
})(BattleStatus || (exports.BattleStatus = BattleStatus = {}));
let Battle = class Battle {
    id;
    type;
    status;
    turn;
    participants;
    logs;
    startedAt;
    lastActionTime;
    endedAt;
};
exports.Battle = Battle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Battle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BattleType,
        name: 'battle_type',
    }),
    __metadata("design:type", String)
], Battle.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BattleStatus,
        name: 'status',
        default: BattleStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Battle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Battle.prototype, "turn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'participants' }),
    __metadata("design:type", Array)
], Battle.prototype, "participants", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'logs', default: [] }),
    __metadata("design:type", Array)
], Battle.prototype, "logs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'started_at' }),
    __metadata("design:type", Date)
], Battle.prototype, "startedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', name: 'last_action_time', nullable: true }),
    __metadata("design:type", Date)
], Battle.prototype, "lastActionTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', name: 'ended_at', nullable: true }),
    __metadata("design:type", Date)
], Battle.prototype, "endedAt", void 0);
exports.Battle = Battle = __decorate([
    (0, typeorm_1.Entity)('battles')
], Battle);
//# sourceMappingURL=battle.entity.js.map