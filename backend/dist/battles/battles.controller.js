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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattlesController = void 0;
const common_1 = require("@nestjs/common");
const battles_service_1 = require("./battles.service");
const jwt_auth_guard_1 = require("../modules/auth/guards/jwt-auth.guard");
let BattlesController = class BattlesController {
    battlesService;
    constructor(battlesService) {
        this.battlesService = battlesService;
    }
    async createPvEBattle(body, req) {
        return this.battlesService.createPvEBattle(body.characterId, body.monsterIds);
    }
    async createPvPBattle(body, req) {
        return this.battlesService.createPvPBattle(body.characterIds);
    }
    async performAction(battleId, body, req) {
        return this.battlesService.performAction(+battleId, body.participantId, body.action);
    }
};
exports.BattlesController = BattlesController;
__decorate([
    (0, common_1.Post)('pve'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BattlesController.prototype, "createPvEBattle", null);
__decorate([
    (0, common_1.Post)('pvp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BattlesController.prototype, "createPvPBattle", null);
__decorate([
    (0, common_1.Post)('action/:battleId'),
    __param(0, (0, common_1.Param)('battleId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], BattlesController.prototype, "performAction", null);
exports.BattlesController = BattlesController = __decorate([
    (0, common_1.Controller)('battles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [battles_service_1.BattlesService])
], BattlesController);
//# sourceMappingURL=battles.controller.js.map