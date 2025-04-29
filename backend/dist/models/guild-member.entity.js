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
exports.GuildMember = void 0;
const typeorm_1 = require("typeorm");
const character_entity_1 = require("./character.entity");
const guild_entity_1 = require("./guild.entity");
let GuildMember = class GuildMember {
    id;
    guildId;
    guild;
    characterId;
    character;
    rank;
    joinedAt;
};
exports.GuildMember = GuildMember;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], GuildMember.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'guild_id' }),
    __metadata("design:type", Number)
], GuildMember.prototype, "guildId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => guild_entity_1.Guild, guild => guild.members),
    (0, typeorm_1.JoinColumn)({ name: 'guild_id' }),
    __metadata("design:type", guild_entity_1.Guild)
], GuildMember.prototype, "guild", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'character_id' }),
    __metadata("design:type", Number)
], GuildMember.prototype, "characterId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => character_entity_1.Character, character => character.guildMember),
    (0, typeorm_1.JoinColumn)({ name: 'character_id' }),
    __metadata("design:type", character_entity_1.Character)
], GuildMember.prototype, "character", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], GuildMember.prototype, "rank", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone', name: 'joined_at' }),
    __metadata("design:type", Date)
], GuildMember.prototype, "joinedAt", void 0);
exports.GuildMember = GuildMember = __decorate([
    (0, typeorm_1.Entity)('guild_members')
], GuildMember);
//# sourceMappingURL=guild-member.entity.js.map