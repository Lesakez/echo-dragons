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
exports.CharactersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const character_entity_1 = require("../../models/character.entity");
let CharactersService = class CharactersService {
    charactersRepository;
    constructor(charactersRepository) {
        this.charactersRepository = charactersRepository;
    }
    async create(userId, createCharacterDto) {
        const character = this.charactersRepository.create({
            ...createCharacterDto,
            userId: userId,
            faction: createCharacterDto.faction,
            class: createCharacterDto.class,
            level: 1,
            experience: 0,
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            strength: 10,
            dexterity: 10,
            intuition: 10,
            endurance: 10,
            intelligence: 10,
            wisdom: 10,
            availableStatPoints: 0,
            availableSkillPoints: 0,
            gold: 100,
        });
        return this.charactersRepository.save(character);
    }
    async findAllByUser(userId) {
        return this.charactersRepository.find({
            where: { userId },
        });
    }
    async findOne(id, userId) {
        const character = await this.charactersRepository.findOne({
            where: { id },
            relations: ['inventorySlots', 'skills', 'quests', 'reputations'],
        });
        if (!character) {
            throw new common_1.NotFoundException(`Персонаж с ID ${id} не найден`);
        }
        if (character.userId !== userId) {
            throw new common_1.ForbiddenException('У вас нет доступа к этому персонажу');
        }
        return character;
    }
    async update(id, userId, updateCharacterDto) {
        const character = await this.findOne(id, userId);
        const allowedFields = ['name'];
        for (const field of allowedFields) {
            if (updateCharacterDto[field] !== undefined) {
                character[field] = updateCharacterDto[field];
            }
        }
        return this.charactersRepository.save(character);
    }
    async remove(id, userId) {
        const character = await this.findOne(id, userId);
        await this.charactersRepository.remove(character);
    }
};
exports.CharactersService = CharactersService;
exports.CharactersService = CharactersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(character_entity_1.Character)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CharactersService);
//# sourceMappingURL=characters.service.js.map