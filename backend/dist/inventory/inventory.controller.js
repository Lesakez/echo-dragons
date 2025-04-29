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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../modules/auth/guards/jwt-auth.guard");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getCharacterInventory(characterId, req) {
        const user = req.user;
        return this.inventoryService.getCharacterInventory(+characterId, user.id);
    }
    async equipItem(characterId, body, req) {
        const user = req.user;
        return this.inventoryService.equipItem(+characterId, user.id, body.inventorySlotId, body.equipSlotType);
    }
    async unequipItem(characterId, body, req) {
        const user = req.user;
        return this.inventoryService.unequipItem(+characterId, user.id, body.equipSlotType);
    }
    async useItem(characterId, body, req) {
        const user = req.user;
        return this.inventoryService.useItem(+characterId, user.id, body.inventorySlotId);
    }
    async moveItem(characterId, body, req) {
        const user = req.user;
        return this.inventoryService.moveItem(+characterId, user.id, body.fromSlotIndex, body.toSlotIndex);
    }
    async deleteItem(characterId, inventorySlotId, req) {
        const user = req.user;
        return this.inventoryService.deleteItem(+characterId, user.id, +inventorySlotId);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)('character/:characterId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getCharacterInventory", null);
__decorate([
    (0, common_1.Post)('character/:characterId/equip'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "equipItem", null);
__decorate([
    (0, common_1.Post)('character/:characterId/unequip'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "unequipItem", null);
__decorate([
    (0, common_1.Post)('character/:characterId/use'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "useItem", null);
__decorate([
    (0, common_1.Post)('character/:characterId/move'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "moveItem", null);
__decorate([
    (0, common_1.Delete)('character/:characterId/item/:inventorySlotId'),
    __param(0, (0, common_1.Param)('characterId')),
    __param(1, (0, common_1.Param)('inventorySlotId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "deleteItem", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map