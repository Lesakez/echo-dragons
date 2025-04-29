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
exports.Quest = void 0;
const typeorm_1 = require("typeorm");
let Quest = class Quest {
    id;
    name;
    description;
    faction;
    minLevel;
    maxLevel;
    isRepeatable;
    isDaily;
    isWeekly;
    isMainStory;
    prerequisites;
    requiredReputation;
    rewardExperience;
    rewardGold;
    rewardItems;
    rewardReputation;
    iconPath;
};
exports.Quest = Quest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Quest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Quest.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Quest.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], Quest.prototype, "faction", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1, name: 'min_level' }),
    __metadata("design:type", Number)
], Quest.prototype, "minLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 100, name: 'max_level' }),
    __metadata("design:type", Number)
], Quest.prototype, "maxLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_repeatable' }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isRepeatable", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_daily' }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isDaily", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_weekly' }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isWeekly", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'is_main_story' }),
    __metadata("design:type", Boolean)
], Quest.prototype, "isMainStory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], Quest.prototype, "prerequisites", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'required_reputation' }),
    __metadata("design:type", Object)
], Quest.prototype, "requiredReputation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'reward_experience' }),
    __metadata("design:type", Number)
], Quest.prototype, "rewardExperience", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0, name: 'reward_gold' }),
    __metadata("design:type", Number)
], Quest.prototype, "rewardGold", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'reward_items' }),
    __metadata("design:type", Array)
], Quest.prototype, "rewardItems", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, name: 'reward_reputation' }),
    __metadata("design:type", Object)
], Quest.prototype, "rewardReputation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'icon_path' }),
    __metadata("design:type", String)
], Quest.prototype, "iconPath", void 0);
exports.Quest = Quest = __decorate([
    (0, typeorm_1.Entity)('quests')
], Quest);
//# sourceMappingURL=quest.entity.js.map