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
exports.Item = void 0;
const typeorm_1 = require("typeorm");
let Item = class Item {
    id;
    name;
    type;
    subtype;
    rarity;
    levelRequirement;
    classRequirement;
    factionRequirement;
    stackable;
    sellable;
    tradeable;
    basePrice;
    description;
    attributes;
    iconPath;
};
exports.Item = Item;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Item.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Item.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Item.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "subtype", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Item.prototype, "rarity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'level_requirement' }),
    __metadata("design:type", Number)
], Item.prototype, "levelRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'class_requirement' }),
    __metadata("design:type", String)
], Item.prototype, "classRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'faction_requirement' }),
    __metadata("design:type", String)
], Item.prototype, "factionRequirement", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Item.prototype, "stackable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Item.prototype, "sellable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Item.prototype, "tradeable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'base_price' }),
    __metadata("design:type", Number)
], Item.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Item.prototype, "attributes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'icon_path', nullable: true }),
    __metadata("design:type", String)
], Item.prototype, "iconPath", void 0);
exports.Item = Item = __decorate([
    (0, typeorm_1.Entity)('items')
], Item);
//# sourceMappingURL=item.entity.js.map