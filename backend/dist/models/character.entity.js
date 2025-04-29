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
exports.Character = exports.CharacterClass = exports.Faction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const inventory_slot_entity_1 = require("./inventory-slot.entity");
const character_skill_entity_1 = require("./character-skill.entity");
const character_quest_entity_1 = require("./character-quest.entity");
const character_reputation_entity_1 = require("./character-reputation.entity");
const guild_member_entity_1 = require("./guild-member.entity");
var Faction;
(function (Faction) {
    Faction["AVRELIA"] = "avrelia";
    Faction["INFERNO"] = "inferno";
})(Faction || (exports.Faction = Faction = {}));
var CharacterClass;
(function (CharacterClass) {
    CharacterClass["WARRIOR"] = "warrior";
    CharacterClass["MAGE"] = "mage";
    CharacterClass["ROGUE"] = "rogue";
    CharacterClass["PRIEST"] = "priest";
})(CharacterClass || (exports.CharacterClass = CharacterClass = {}));
let Character = class Character {
    id;
    userId;
    user;
    name;
    faction;
    class;
    level;
    experience;
    health;
    maxHealth;
    mana;
    maxMana;
    strength;
    dexterity;
    intuition;
    endurance;
    intelligence;
    wisdom;
    availableStatPoints;
    availableSkillPoints;
    xPosition;
    yPosition;
    currentMap;
    gold;
    createdAt;
    updatedAt;
    inventorySlots;
    skills;
    quests;
    reputations;
    guildMember;
    getDamage() {
        let baseDamage = 5;
        let damageRange = 3;
        switch (this.class) {
            case CharacterClass.WARRIOR:
                baseDamage += this.strength * 0.8 + this.dexterity * 0.2;
                damageRange += Math.floor(this.strength / 10);
                break;
            case CharacterClass.MAGE:
                baseDamage += this.intelligence * 0.8 + this.wisdom * 0.2;
                damageRange += Math.floor(this.intelligence / 10);
                break;
            case CharacterClass.ROGUE:
                baseDamage += this.dexterity * 0.7 + this.intuition * 0.3;
                damageRange += Math.floor(this.dexterity / 8);
                break;
            case CharacterClass.PRIEST:
                baseDamage += this.wisdom * 0.6 + this.intelligence * 0.4;
                damageRange += Math.floor(this.wisdom / 12);
                break;
        }
        baseDamage += this.level * 0.5;
        return {
            min: Math.floor(baseDamage - damageRange / 2),
            max: Math.ceil(baseDamage + damageRange / 2)
        };
    }
    getDefense() {
        let baseDefense = 0;
        switch (this.class) {
            case CharacterClass.WARRIOR:
                baseDefense += this.endurance * 0.8 + this.strength * 0.2;
                break;
            case CharacterClass.MAGE:
                baseDefense += this.endurance * 0.4 + this.intelligence * 0.2;
                break;
            case CharacterClass.ROGUE:
                baseDefense += this.endurance * 0.5 + this.dexterity * 0.3;
                break;
            case CharacterClass.PRIEST:
                baseDefense += this.endurance * 0.6 + this.wisdom * 0.2;
                break;
        }
        baseDefense += this.level * 0.3;
        return Math.floor(baseDefense);
    }
    getMagicResistance() {
        let baseMagicResistance = 0;
        switch (this.class) {
            case CharacterClass.WARRIOR:
                baseMagicResistance += this.endurance * 0.3 + this.wisdom * 0.2;
                break;
            case CharacterClass.MAGE:
                baseMagicResistance += this.intelligence * 0.4 + this.wisdom * 0.4;
                break;
            case CharacterClass.ROGUE:
                baseMagicResistance += this.intuition * 0.4 + this.wisdom * 0.2;
                break;
            case CharacterClass.PRIEST:
                baseMagicResistance += this.wisdom * 0.7 + this.intelligence * 0.2;
                break;
        }
        baseMagicResistance += this.level * 0.2;
        return Math.floor(baseMagicResistance);
    }
    getCriticalChance() {
        let baseCritChance = 5;
        switch (this.class) {
            case CharacterClass.WARRIOR:
                baseCritChance += this.strength * 0.1 + this.intuition * 0.2;
                break;
            case CharacterClass.MAGE:
                baseCritChance += this.intelligence * 0.1 + this.intuition * 0.1;
                break;
            case CharacterClass.ROGUE:
                baseCritChance += this.dexterity * 0.2 + this.intuition * 0.3;
                break;
            case CharacterClass.PRIEST:
                baseCritChance += this.wisdom * 0.1 + this.intuition * 0.2;
                break;
        }
        return Math.min(Math.floor(baseCritChance), 50);
    }
    getEvasionChance() {
        let baseEvasion = 3;
        switch (this.class) {
            case CharacterClass.WARRIOR:
                baseEvasion += this.dexterity * 0.1 + this.intuition * 0.1;
                break;
            case CharacterClass.MAGE:
                baseEvasion += this.dexterity * 0.1 + this.intuition * 0.1;
                break;
            case CharacterClass.ROGUE:
                baseEvasion += this.dexterity * 0.3 + this.intuition * 0.2;
                break;
            case CharacterClass.PRIEST:
                baseEvasion += this.dexterity * 0.15 + this.intuition * 0.15;
                break;
        }
        return Math.min(Math.floor(baseEvasion), 40);
    }
    getExpForNextLevel() {
        return 100 * this.level + Math.pow(this.level, 2) * 50;
    }
    addExperience(amount) {
        const oldLevel = this.level;
        this.experience += amount;
        let leveledUp = false;
        while (this.experience >= this.getExpForNextLevel() && this.level < 100) {
            this.level += 1;
            this.availableStatPoints += 5;
            this.availableSkillPoints += 1;
            this.maxHealth += 10 + Math.floor(this.endurance * 0.5);
            this.health = this.maxHealth;
            this.maxMana += 5 + Math.floor((this.intelligence + this.wisdom) * 0.3);
            this.mana = this.maxMana;
            leveledUp = true;
        }
        return {
            leveledUp,
            newLevel: leveledUp ? this.level : undefined
        };
    }
};
exports.Character = Character;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Character.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Character.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.characters),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Character.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], Character.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Faction,
    }),
    __metadata("design:type", String)
], Character.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CharacterClass,
    }),
    __metadata("design:type", String)
], Character.prototype, "class", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Character.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "experience", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Character.prototype, "health", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Character.prototype, "maxHealth", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Character.prototype, "mana", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Character.prototype, "maxMana", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "dexterity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "intuition", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "endurance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "intelligence", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Character.prototype, "wisdom", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "availableStatPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "availableSkillPoints", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "xPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Character.prototype, "yPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'starting_area' }),
    __metadata("design:type", String)
], Character.prototype, "currentMap", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100 }),
    __metadata("design:type", Number)
], Character.prototype, "gold", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Character.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], Character.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inventory_slot_entity_1.InventorySlot, inventorySlot => inventorySlot.character),
    __metadata("design:type", Array)
], Character.prototype, "inventorySlots", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => character_skill_entity_1.CharacterSkill, characterSkill => characterSkill.character),
    __metadata("design:type", Array)
], Character.prototype, "skills", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => character_quest_entity_1.CharacterQuest, characterQuest => characterQuest.character),
    __metadata("design:type", Array)
], Character.prototype, "quests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => character_reputation_entity_1.CharacterReputation, characterReputation => characterReputation.character),
    __metadata("design:type", Array)
], Character.prototype, "reputations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => guild_member_entity_1.GuildMember, guildMember => guildMember.character),
    __metadata("design:type", guild_member_entity_1.GuildMember)
], Character.prototype, "guildMember", void 0);
exports.Character = Character = __decorate([
    (0, typeorm_1.Entity)('characters')
], Character);
//# sourceMappingURL=character.entity.js.map