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
exports.Guild = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const guild_member_entity_1 = require("./guild-member.entity");
let Guild = class Guild {
    id;
    name;
    faction;
    leaderId;
    leader;
    description;
    emblem;
    createdAt;
    level;
    experience;
    gold;
    members;
};
exports.Guild = Guild;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Guild.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, unique: true }),
    __metadata("design:type", String)
], Guild.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Guild.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'leader_id' }),
    __metadata("design:type", Number)
], Guild.prototype, "leaderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character),
    (0, typeorm_1.JoinColumn)({ name: 'leader_id' }),
    __metadata("design:type", character_entity_1.Character)
], Guild.prototype, "leader", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Guild.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Guild.prototype, "emblem", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'created_at' }),
    __metadata("design:type", Date)
], Guild.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Guild.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Guild.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Guild.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => guild_member_entity_1.GuildMember, guildMember => guildMember.guild),
    __metadata("design:type", Array)
], Guild.prototype, "members", void 0);
exports.Guild = Guild = __decorate([
    (0, typeorm_1.Entity)('guilds')
], Guild);
//# sourceMappingURL=guild.entity.js.map