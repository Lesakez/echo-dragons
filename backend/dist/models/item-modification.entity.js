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
exports.ItemModification = void 0;
const typeorm_1 = require("typeorm");
const inventory_slot_entity_1 = require("./inventory-slot.entity");
let ItemModification = class ItemModification {
    id;
    inventorySlotId;
    inventorySlot;
    modificationType;
    level;
    bonusAttributes;
    createdAt;
};
exports.ItemModification = ItemModification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ItemModification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inventory_slot_id' }),
    __metadata("design:type", Number)
], ItemModification.prototype, "inventorySlotId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => inventory_slot_entity_1.InventorySlot, inventorySlot => inventorySlot.modifications),
    (0, typeorm_1.JoinColumn)({ name: 'inventory_slot_id' }),
    __metadata("design:type", inventory_slot_entity_1.InventorySlot)
], ItemModification.prototype, "inventorySlot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'modification_type', length: 50 }),
    __metadata("design:type", String)
], ItemModification.prototype, "modificationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], ItemModification.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'bonus_attributes', nullable: true }),
    __metadata("design:type", Object)
], ItemModification.prototype, "bonusAttributes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], ItemModification.prototype, "createdAt", void 0);
exports.ItemModification = ItemModification = __decorate([
    (0, typeorm_1.Entity)('item_modifications')
], ItemModification);
//# sourceMappingURL=item-modification.entity.js.map