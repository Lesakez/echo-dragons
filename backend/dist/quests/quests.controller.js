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
exports.QuestsController = void 0;
const common_1 = require("@nestjs/common");
const quests_service_1 = require("./quests.service");
const jwt_auth_guard_1 = require("../modules/auth/guards/jwt-auth.guard");
let QuestsController = class QuestsController {
    questsService;
    constructor(questsService) {
        this.questsService = questsService;
    }
    async getAllQuests() {
        return this.questsService.getAllQuests();
    }
    async getCharacterQuests(characterId, req) {
        const user = req.user;
        return this.questsService.getCharacterQuests(+characterId, user.id);
    }
    async getAvailableQuests(characterId, req) {
        const user = req.user;
        return this.questsService.getAvailableQuests(+characterId, user.id);
    }
    async acceptQuest(characterId, body, req) {
        const user = req.user;
        return this.questsService.acceptQuest(+characterId, user.id, body.questId);
    }
    async completeQuest(characterId, body, req) {
        const user = req.user;
        return this.questsService.completeQuest(+characterId, user.id, body.characterQuestId);
    }
    async abandonQuest(characterId, body, req) {
        const user = req.user;
        return this.questsService.abandonQuest(+characterId, user.id, body.characterQuestId);
    }
    async getNpcQuests(npcId) {
        return this.questsService.getNpcQuests(+npcId);
    }
};
exports.QuestsController = QuestsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "getAllQuests", null);
__decorate([
    (0, common_1.Get)('character/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "getCharacterQuests", null);
__decorate([
    (0, common_1.Get)('available/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "getAvailableQuests", null);
__decorate([
    (0, common_1.Post)('accept/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "acceptQuest", null);
__decorate([
    (0, common_1.Post)('complete/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "completeQuest", null);
__decorate([
    (0, common_1.Post)('abandon/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "abandonQuest", null);
__decorate([
    (0, common_1.Get)('npc/:npcId'),
    __param(0, (0, common_1.Param)('npcId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], QuestsController.prototype, "getNpcQuests", null);
exports.QuestsController = QuestsController = __decorate([
    (0, common_1.Controller)('quests'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [quests_service_1.QuestsService])
], QuestsController);
//# sourceMappingURL=quests.controller.js.map