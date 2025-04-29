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
exports.Faction = void 0;
const typeorm_1 = require("typeorm");
const character_reputation_entity_1 = require("./character-reputation.entity");
let Faction = class Faction {
    id;
    name;
    description;
    isMajor;
    parentFactionId;
    parentFaction;
    startingReputation;
    hostileTowards;
    characterReputations;
    subFactions;
};
exports.Faction = Faction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Faction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Faction.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Faction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_major' }),
    __metadata("design:type", Boolean)
], Faction.prototype, "isMajor", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'parent_faction_id' }),
    __metadata("design:type", Number)
], Faction.prototype, "parentFactionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Faction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'parent_faction_id' }),
    __metadata("design:type", Faction)
], Faction.prototype, "parentFaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'starting_reputation' }),
    __metadata("design:type", Number)
], Faction.prototype, "startingReputation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'hostile_towards' }),
    __metadata("design:type", Array)
], Faction.prototype, "hostileTowards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => character_reputation_entity_1.CharacterReputation, characterReputation => characterReputation.faction),
    __metadata("design:type", Array)
], Faction.prototype, "characterReputations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Faction, faction => faction.parentFaction),
    __metadata("design:type", Array)
], Faction.prototype, "subFactions", void 0);
exports.Faction = Faction = __decorate([
    (0, typeorm_1.Entity)('factions')
], Faction);
//# sourceMappingURL=faction.entity.js.map