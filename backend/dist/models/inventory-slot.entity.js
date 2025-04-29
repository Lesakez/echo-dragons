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
exports.InventorySlot = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const item_entity_1 = require("./item.entity");
const item_modification_entity_1 = require("./item-modification.entity");
let InventorySlot = class InventorySlot {
    id;
    characterId;
    character;
    slotType;
    slotIndex;
    itemId;
    item;
    quantity;
    modifications;
};
exports.InventorySlot = InventorySlot;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InventorySlot.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'character_id' }),
    __metadata("design:type", Number)
], InventorySlot.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, character => character.inventorySlots),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], InventorySlot.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'slot_type', length: 20 }),
    __metadata("design:type", String)
], InventorySlot.prototype, "slotType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'slot_index' }),
    __metadata("design:type", Number)
], InventorySlot.prototype, "slotIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'item_id', nullable: true }),
    __metadata("design:type", Number)
], InventorySlot.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'item_id' }),
    __metadata("design:type", item_entity_1.Item)
], InventorySlot.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], InventorySlot.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_modification_entity_1.ItemModification, itemModification => itemModification.inventorySlot),
    __metadata("design:type", Array)
], InventorySlot.prototype, "modifications", void 0);
exports.InventorySlot = InventorySlot = __decorate([
    (0, typeorm_1.Entity)('inventory_slots')
], InventorySlot);
//# sourceMappingURL=inventory-slot.entity.js.map