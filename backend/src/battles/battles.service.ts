// backend/src/battles/battle.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Character } from '../models/character.entity';
import { Monster } from '../models/monster.entity';
import { Item } from '../models/item.entity';
import { Skill } from '../models/skill.entity';
import { Battle } from '../models/battle-log.entity';
import { BattleParticipant, BattleStatus, BattleType } from '../models/battle.entity';

interface BattleAction {
  type: 'attack' | 'skill' | 'item' | 'block' | 'flee';
  targetId?: number;
  targetZone?: 'head' | 'body' | 'waist' | 'legs';
  blockZones?: ('head' | 'body' | 'waist' | 'legs')[];
  itemId?: number;
  skillId?: number;
  actionPoints: number;
}

interface BattleState {
  id: number;
  type: BattleType;
  status: BattleStatus;
  turn: number;
  participants: BattleParticipantState[];
  logs: string[];
  startTime: Date;
  lastActionTime: Date;
}

interface BattleParticipantState {
  id: number;
  type: 'character' | 'monster';
  entityId: number;
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  initiative: number;
  actionPoints: number;
  maxActionPoints: number;
  team: number;
  effects: BattleEffect[];
  isActive: boolean;
  lastAction?: BattleAction;
  stance: 'offensive' | 'defensive' | 'balanced';
}

interface BattleEffect {
  id: number;
  name: string;
  type: 'buff' | 'debuff';
  affectedStats: { [key: string]: number };
  remainingTurns: number;
  sourceId: number;
}

@Injectable()
export class BattleService {
  private activeBattles: Map<number, BattleState> = new Map();

  constructor(
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Monster)
    private monsterRepository: Repository<Monster>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(Battle)
    private battleLogRepository: Repository<Battle>,
  ) {}

  async createPvEBattle(characterId: number, monsterIds: number[]): Promise<BattleState> {
    const character = await this.characterRepository.findOne({ where: { id: characterId } });
    if (!character) {
      throw new Error('Character not found');
    }

    const monsters = await this.monsterRepository.findByIds(monsterIds);
    if (monsters.length !== monsterIds.length) {
      throw new Error('Some monsters not found');
    }

    // Создаем новый бой
    const battleId = Date.now(); // В реальной системе использовали бы UUID или БД
    const battle: BattleState = {
      id: battleId,
      type: BattleType.PVE,
      status: BattleStatus.ACTIVE,
      turn: 1,
      participants: [],
      logs: ['Битва началась!'],
      startTime: new Date(),
      lastActionTime: new Date(),
    };

    // Добавляем персонажа в бой
    const characterParticipant: BattleParticipantState = {
      id: 1, // Уникальный ID в рамках битвы
      type: 'character',
      entityId: character.id,
      name: character.name,
      health: character.health,
      maxHealth: character.maxHealth,
      mana: character.mana,
      maxMana: character.maxMana,
      initiative: this.calculateInitiative(character),
      actionPoints: 5, // Базовое количество очков действий
      maxActionPoints: 5,
      team: 1, // Персонажи на стороне игрока
      effects: [],
      isActive: true,
      stance: 'balanced',
    };
    battle.participants.push(characterParticipant);

    // Добавляем монстров в бой
    monsters.forEach((monster, index) => {
      const monsterParticipant: BattleParticipantState = {
        id: index + 2, // Начинаем с 2, так как 1 уже занят персонажем
        type: 'monster',
        entityId: monster.id,
        name: monster.name,
        health: monster.health,
        maxHealth: monster.health,
        mana: monster.mana || 0,
        maxMana: monster.mana || 0,
        initiative: this.calculateMonsterInitiative(monster),
        actionPoints: 4, // У монстров обычно меньше ОД
        maxActionPoints: 4,
        team: 2, // Монстры на стороне противника
        effects: [],
        isActive: true,
        stance: 'offensive', // Монстры обычно агрессивны
      };
      battle.participants.push(monsterParticipant);
    });

    // Сортируем участников по инициативе (высшая первая)
    battle.participants.sort((a, b) => b.initiative - a.initiative);

    // Сохраняем бой в активные бои
    this.activeBattles.set(battleId, battle);

    return battle;
  }

  async createPvPBattle(characterIds: number[]): Promise<BattleState> {
    const characters = await this.characterRepository.findByIds(characterIds);
    if (characters.length !== characterIds.length) {
      throw new Error('Some characters not found');
    }

    // Создаем новый бой
    const battleId = Date.now();
    const battle: BattleState = {
      id: battleId,
      type: BattleType.PVP,
      status: BattleStatus.ACTIVE,
      turn: 1,
      participants: [],
      logs: ['PvP битва началась!'],
      startTime: new Date(),
      lastActionTime: new Date(),
    };

    // Добавляем персонажей в бой, распределяя по командам
    characters.forEach((character, index) => {
      const team = character.faction === 'avrelia' ? 1 : 2; // Распределяем по фракциям
      
      const characterParticipant: BattleParticipantState = {
        id: index + 1,
        type: 'character',
        entityId: character.id,
        name: character.name,
        health: character.health,
        maxHealth: character.maxHealth,
        mana: character.mana,
        maxMana: character.maxMana,
        initiative: this.calculateInitiative(character),
        actionPoints: 5,
        maxActionPoints: 5,
        team: team,
        effects: [],
        isActive: true,
        stance: 'balanced',
      };
      battle.participants.push(characterParticipant);
    });

    // Сортируем участников по инициативе
    battle.participants.sort((a, b) => b.initiative - a.initiative);

    // Сохраняем бой в активные бои
    this.activeBattles.set(battleId, battle);

    return battle;
  }

  async performAction(battleId: number, participantId: number, action: BattleAction): Promise<BattleState> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    // Проверяем, активен ли бой
    if (battle.status !== BattleStatus.ACTIVE) {
      throw new Error('Battle is not active');
    }

    // Проверяем, существует ли участник
    const participant = battle.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    // Проверяем, ход ли участника
    const currentParticipant = this.getCurrentParticipant(battle);
    if (currentParticipant.id !== participantId) {
      throw new Error('Not your turn');
    }

    // Проверяем, достаточно ли очков действий
    if (participant.actionPoints < action.actionPoints) {
      throw new Error('Not enough action points');
    }

    // Выполняем действие в зависимости от типа
    switch (action.type) {
      case 'attack':
        await this.handleAttack(battle, participant, action);
        break;
      case 'skill':
        await this.handleSkill(battle, participant, action);
        break;
      case 'item':
        await this.handleItem(battle, participant, action);
        break;
      case 'block':
        await this.handleBlock(battle, participant, action);
        break;
      case 'flee':
        await this.handleFlee(battle, participant, action);
        break;
      default:
        throw new Error('Unknown action type');
    }

    // Сохраняем последнее действие участника
    participant.lastAction = action;
    
    // Вычитаем очки действий
    participant.actionPoints -= action.actionPoints;

    // Обновляем время последнего действия
    battle.lastActionTime = new Date();

    // Проверяем, закончен ли ход участника (нет ОД или использовал flee)
    if (participant.actionPoints <= 0 || action.type === 'flee') {
      this.endParticipantTurn(battle, participant);
    }

    // Проверяем, закончен ли бой
    this.checkBattleEnd(battle);

    return battle;
  }

  private async handleAttack(battle: BattleState, attacker: BattleParticipantState, action: BattleAction): Promise<void> {
    // Проверяем наличие цели
    if (!action.targetId) {
      throw new Error('Target ID is required for attack');
    }

    // Проверяем наличие зоны атаки
    if (!action.targetZone) {
      throw new Error('Target zone is required for attack');
    }

    // Находим цель
    const target = battle.participants.find(p => p.id === action.targetId);
    if (!target) {
      throw new Error('Target not found');
    }

    // Проверяем, что цель не в той же команде
    if (attacker.team === target.team) {
      throw new Error('Cannot attack ally');
    }

    // Проверяем, активна ли цель
    if (!target.isActive) {
      throw new Error('Target is not active');
    }

    // Рассчитываем шанс попадания
    let hitChance = 75; // Базовый шанс попадания 75%
    
    // Учитываем стойку атакующего
    if (attacker.stance === 'offensive') {
      hitChance += 10; // +10% в атакующей стойке
    } else if (attacker.stance === 'defensive') {
      hitChance -= 5; // -5% в защитной стойке
    }
    
    // Учитываем эффекты на атакующем
    attacker.effects.forEach(effect => {
      if (effect.affectedStats.hitChance) {
        hitChance += effect.affectedStats.hitChance;
      }
    });
    
    // Учитываем зону атаки
    switch (action.targetZone) {
      case 'head':
        hitChance -= 15; // Сложнее попасть в голову
        break;
      case 'body':
        hitChance += 5; // Легче попасть в тело
        break;
      case 'waist':
        break; // Обычная сложность для пояса
      case 'legs':
        hitChance -= 5; // Немного сложнее попасть по ногам
        break;
    }

    // Учитываем блок цели
    if (target.lastAction && target.lastAction.type === 'block' && target.lastAction.blockZones) {
      if (target.lastAction.blockZones.includes(action.targetZone)) {
        hitChance -= 30; // Значительное снижение шанса при блоке правильной зоны
        battle.logs.push(`${target.name} блокирует удар в ${this.getZoneName(action.targetZone)}!`);
      }
    }

    // Учитываем эффекты на цели
    target.effects.forEach(effect => {
      if (effect.affectedStats.dodgeChance) {
        hitChance -= effect.affectedStats.dodgeChance;
      }
    });

    // Ограничиваем шанс попадания в пределах 5-95%
    hitChance = Math.max(5, Math.min(95, hitChance));

    // Бросаем кубик
    const roll = Math.random() * 100;
    const hit = roll <= hitChance;

    // Если промах
    if (!hit) {
      battle.logs.push(`${attacker.name} промахивается по ${this.getZoneName(action.targetZone)} ${target.name}!`);
      return;
    }

    // Если попадание, рассчитываем урон
    let damage = this.calculateDamage(attacker, target, action.targetZone);
    
    // Применяем урон
    target.health = Math.max(0, target.health - damage);
    
    // Логируем результат
    battle.logs.push(`${attacker.name} наносит ${damage} урона по ${this.getZoneName(action.targetZone)} ${target.name}!`);
    
    // Проверяем, жива ли цель
    if (target.health <= 0) {
      target.isActive = false;
      battle.logs.push(`${target.name} побежден!`);
    }
  }

  private async handleSkill(battle: BattleState, caster: BattleParticipantState, action: BattleAction): Promise<void> {
    // Проверяем наличие ID умения
    if (!action.skillId) {
      throw new Error('Skill ID is required');
    }

    // Получаем данные умения из БД
    const skill = await this.skillRepository.findOne({ where: { id: action.skillId } }) as unknown as SkillComplete;
    if (!skill) {
      throw new Error('Skill not found');
    }

    // Проверяем, достаточно ли маны
    if (caster.mana < skill.manaCost) {
      throw new Error('Not enough mana');
    }

    // Проверяем наличие цели, если умение требует
    let target: BattleParticipantState | null = null;
    
    if (skill.targetType !== 'self' && !action.targetId) {
      throw new Error('Target ID is required for this skill');
    }

    if (action.targetId) {
      target = battle.participants.find(p => p.id === action.targetId) || null;
      if (!target) {
        throw new Error('Target not found');
      }

      // Проверяем, активна ли цель
      if (!target.isActive) {
        throw new Error('Target is not active');
      }

      // Проверяем команду цели, если умение не должно применяться к врагам/союзникам
      if (skill.targetTeam === 'enemy' && target.team === caster.team) {
        throw new Error('This skill can only target enemies');
      }
      if (skill.targetTeam === 'ally' && target.team !== caster.team) {
        throw new Error('This skill can only target allies');
      }
    }

    // Вычитаем ману
    caster.mana -= skill.manaCost;

    // Применяем эффекты умения
    switch (skill.effectType) {
      case 'damage':
        if (!target) throw new Error('Target required for damage skill');
        const damage = this.calculateSkillDamage(caster, target, skill);
        target.health = Math.max(0, target.health - damage);
        battle.logs.push(`${caster.name} использует ${skill.name} и наносит ${damage} урона ${target.name}!`);
        
        // Проверяем дополнительные эффекты умения
        if (skill.additionalEffects && skill.additionalEffects.length > 0) {
          this.applyAdditionalEffects(battle, caster, target, skill);
        }
        
        // Проверяем, жива ли цель
        if (target.health <= 0) {
          target.isActive = false;
          battle.logs.push(`${target.name} побежден!`);
        }
        break;
        
      case 'heal':
        if (!target) target = caster; // Если цель не указана, лечим себя
        const healing = this.calculateHealing(caster, skill);
        target.health = Math.min(target.maxHealth, target.health + healing);
        battle.logs.push(`${caster.name} использует ${skill.name} и восстанавливает ${healing} здоровья ${target.name === caster.name ? 'себе' : target.name}!`);
        break;
        
      case 'buff':
        if (!target) target = caster; // Если цель не указана, накладываем на себя
        if (!skill.statModifiers) {
          skill.statModifiers = {}; // Создаем пустой объект, если отсутствует
        }
        const buff: BattleEffect = {
          id: Date.now(), // Уникальный ID для эффекта
          name: skill.name,
          type: 'buff',
          affectedStats: skill.statModifiers,
          remainingTurns: skill.duration || 1, // По умолчанию 1 ход, если не указано
          sourceId: caster.id
        };
        target.effects.push(buff);
        battle.logs.push(`${caster.name} использует ${skill.name} на ${target.name === caster.name ? 'себя' : target.name}!`);
        break;
        
      case 'debuff':
        if (!target) throw new Error('Target required for debuff skill');
        if (!skill.statModifiers) {
          skill.statModifiers = {}; // Создаем пустой объект, если отсутствует
        }
        const debuff: BattleEffect = {
          id: Date.now(),
          name: skill.name,
          type: 'debuff',
          affectedStats: skill.statModifiers,
          remainingTurns: skill.duration || 1,
          sourceId: caster.id
        };
        target.effects.push(debuff);
        battle.logs.push(`${caster.name} использует ${skill.name} на ${target.name}!`);
        break;
        
      case 'aoe_damage':
        // Получаем всех врагов или союзников, в зависимости от типа умения
        const targets = battle.participants.filter(p => 
          p.isActive && 
          (skill.targetTeam === 'enemy' ? p.team !== caster.team : p.team === caster.team)
        );
        
        for (const aoeTarget of targets) {
          const aoeDamage = this.calculateSkillDamage(caster, aoeTarget, skill) * 0.7; // AoE обычно наносит меньше урона
          aoeTarget.health = Math.max(0, aoeTarget.health - aoeDamage);
          
          // Проверяем, жива ли цель
          if (aoeTarget.health <= 0) {
            aoeTarget.isActive = false;
            battle.logs.push(`${aoeTarget.name} побежден!`);
          }
        }
        
        battle.logs.push(`${caster.name} использует ${skill.name} и наносит урон всем врагам!`);
        break;
    }
  }

  private async handleItem(battle: BattleState, user: BattleParticipantState, action: BattleAction): Promise<void> {
    // Проверяем наличие ID предмета
    if (!action.itemId) {
      throw new Error('Item ID is required');
    }

    // Получаем данные предмета из БД
    const item = await this.itemRepository.findOne({ where: { id: action.itemId } });
    if (!item) {
      throw new Error('Item not found');
    }

    // Логика в зависимости от типа предмета
    switch (item.type) {
      case 'potion':
        // Находим цель, если не указана - применяем к себе
        let target = user;
        if (action.targetId && action.targetId !== user.id) {
          target = battle.participants.find(p => p.id === action.targetId);
          if (!target) {
            throw new Error('Target not found');
          }
          
          // Некоторые зелья можно применять только к союзникам
          if (item.subtype === 'healing' && target.team !== user.team) {
            throw new Error('Healing potions can only be used on allies');
          }
        }
        
        // Применяем эффект предмета
        switch (item.subtype) {
          case 'healing':
            const healing = item.attributes.healingAmount || 50; // Значение по умолчанию, если не указано
            target.health = Math.min(target.maxHealth, target.health + healing);
            battle.logs.push(`${user.name} использует ${item.name} и восстанавливает ${healing} здоровья ${target.name === user.name ? 'себе' : target.name}!`);
            break;
            
          case 'mana':
            const manaRestore = item.attributes.manaAmount || 50;
            target.mana = Math.min(target.maxMana, target.mana + manaRestore);
            battle.logs.push(`${user.name} использует ${item.name} и восстанавливает ${manaRestore} маны ${target.name === user.name ? 'себе' : target.name}!`);
            break;
            
          case 'strength':
            const strengthBuff: BattleEffect = {
              id: Date.now(),
              name: item.name,
              type: 'buff',
              affectedStats: { damage: item.attributes.damageBonus || 10 },
              remainingTurns: item.attributes.duration || 3,
              sourceId: user.id
            };
            target.effects.push(strengthBuff);
            battle.logs.push(`${user.name} использует ${item.name} на ${target.name === user.name ? 'себя' : target.name}!`);
            break;
            
          case 'speed':
            const speedBuff: BattleEffect = {
              id: Date.now(),
              name: item.name,
              type: 'buff',
              affectedStats: { initiative: item.attributes.initiativeBonus || 5 },
              remainingTurns: item.attributes.duration || 3,
              sourceId: user.id
            };
            target.effects.push(speedBuff);
            battle.logs.push(`${user.name} использует ${item.name} на ${target.name === user.name ? 'себя' : target.name}!`);
            break;
        }
        break;
        
      case 'scroll':
        // Свитки обычно реализуют эффекты заклинаний без затрат маны
        switch (item.subtype) {
          case 'attack':
            if (!action.targetId) {
              throw new Error('Target ID is required for attack scrolls');
            }
            
            const target = battle.participants.find(p => p.id === action.targetId);
            if (!target) {
              throw new Error('Target not found');
            }
            
            if (target.team === user.team) {
              throw new Error('Cannot use attack scroll on allies');
            }
            
            const damage = item.attributes.damage || 100;
            target.health = Math.max(0, target.health - damage);
            battle.logs.push(`${user.name} использует ${item.name} и наносит ${damage} урона ${target.name}!`);
            
            if (target.health <= 0) {
              target.isActive = false;
              battle.logs.push(`${target.name} побежден!`);
            }
            break;
            
          case 'protection':
            // Свиток защиты, добавляет временный эффект блока
            const protBuff: BattleEffect = {
              id: Date.now(),
              name: item.name,
              type: 'buff',
              affectedStats: { defense: item.attributes.defenseBonus || 20 },
              remainingTurns: item.attributes.duration || 2,
              sourceId: user.id
            };
            user.effects.push(protBuff);
            battle.logs.push(`${user.name} использует ${item.name} и получает временную защиту!`);
            break;
        }
        break;
        
      case 'throwable':
        // Метательные предметы, наносят урон
        if (!action.targetId) {
          throw new Error('Target ID is required for throwable items');
        }
        
        const target = battle.participants.find(p => p.id === action.targetId);
        if (!target) {
          throw new Error('Target not found');
        }
        
        if (target.team === user.team) {
          throw new Error('Cannot use throwable items on allies');
        }
        
        let throwDamage = item.attributes.damage || 30;
        
        // Некоторые метательные предметы имеют бонусы против определенных типов врагов
        if (target.type === 'monster' && item.attributes.monsterTypeBonus) {
          // Здесь нужно было бы проверить тип монстра, но упростим
          throwDamage *= 1.5;
        }
        
        target.health = Math.max(0, target.health - throwDamage);
        battle.logs.push(`${user.name} бросает ${item.name} и наносит ${throwDamage} урона ${target.name}!`);
        
        if (target.health <= 0) {
          target.isActive = false;
          battle.logs.push(`${target.name} побежден!`);
        }
        break;
    }
  }

  private async handleBlock(battle: BattleState, defender: BattleParticipantState, action: BattleAction): Promise<void> {
    // Проверяем наличие зон блока
    if (!action.blockZones || action.blockZones.length === 0) {
      throw new Error('Block zones are required');
    }

    // Проверяем корректность зон блока (не более 2)
    if (action.blockZones.length > 2) {
      throw new Error('Cannot block more than 2 zones');
    }

    // Применяем блок
    battle.logs.push(`${defender.name} готовится блокировать ${action.blockZones.map(zone => this.getZoneName(zone)).join(' и ')}!`);
    
    // Дополнительный бонус к защите при блоке в зависимости от стойки
    if (defender.stance === 'defensive') {
      const defenseBuff: BattleEffect = {
        id: Date.now(),
        name: 'Повышенная защита',
        type: 'buff',
        affectedStats: { defense: 10 },
        remainingTurns: 1, // Только до следующего хода
        sourceId: defender.id
      };
      defender.effects.push(defenseBuff);
    }
  }

  private async handleFlee(battle: BattleState, participant: BattleParticipantState, action: BattleAction): Promise<void> {
    // Шанс на бегство зависит от стойки и наличия эффектов
    let fleeChance = 50; // Базовый шанс 50%
    
    // В защитной стойке легче сбежать
    if (participant.stance === 'defensive') {
      fleeChance += 15;
    } else if (participant.stance === 'offensive') {
      fleeChance -= 10;
    }
    
    // Проверяем эффекты, влияющие на побег
    participant.effects.forEach(effect => {
      if (effect.affectedStats.fleeChance) {
        fleeChance += effect.affectedStats.fleeChance;
      }
    });
    
    // Чем меньше здоровья, тем выше шанс сбежать
    const healthPercent = (participant.health / participant.maxHealth) * 100;
    if (healthPercent < 30) {
      fleeChance += 20;
    } else if (healthPercent < 50) {
      fleeChance += 10;
    }
    
    // Ограничиваем шанс бегства
    fleeChance = Math.max(10, Math.min(90, fleeChance));
    
    // Бросаем кубик
    const roll = Math.random() * 100;
    
    if (roll <= fleeChance) {
      // Успешное бегство
      participant.isActive = false;
      battle.logs.push(`${participant.name} успешно сбегает с поля боя!`);
      
      // Если это PvE бой и сбежал персонаж, то это означает поражение
      if (battle.type === BattleType.PVE && participant.type === 'character') {
        battle.status = BattleStatus.DEFEAT;
        battle.logs.push(`Бой завершается поражением!`);
      }
    } else {
      // Неудачная попытка
      battle.logs.push(`${participant.name} пытается сбежать, но не удаётся!`);
    }
  }

  private getCurrentParticipant(battle: BattleState): BattleParticipantState {
    return battle.participants.find(p => p.isActive && p.actionPoints > 0) || battle.participants[0];
  }

  private endParticipantTurn(battle: BattleState, participant: BattleParticipantState): void {
    // Уменьшаем длительность эффектов
    participant.effects = participant.effects.filter(effect => {
      effect.remainingTurns--;
      return effect.remainingTurns > 0;
    });
    
    // Проверяем, все ли участники закончили ход
    const allDone = battle.participants.every(p => !p.isActive || p.actionPoints <= 0);
    
    if (allDone) {
      this.startNewTurn(battle);
    }
  }

  private startNewTurn(battle: BattleState): void {
    battle.turn += 1;
    battle.logs.push(`--- Ход ${battle.turn} ---`);
    
    // Восстанавливаем очки действий всем активным участникам
    battle.participants.forEach(p => {
      if (p.isActive) {
        p.actionPoints = p.maxActionPoints;
        
        // Применяем эффекты от способностей и предметов, работающие в начале хода
        // Например, регенерация здоровья/маны, урон от отравления и т.д.
        this.applyEffectsAtTurnStart(battle, p);
      }
    });
    
    // Сортируем участников по инициативе для определения порядка ходов
    battle.participants.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return b.initiative - a.initiative;
    });
  }

  private checkBattleEnd(battle: BattleState): void {
    // Проверяем, остались ли активные участники в каждой команде
    const team1Active = battle.participants.some(p => p.isActive && p.team === 1);
    const team2Active = battle.participants.some(p => p.isActive && p.team === 2);
    
    if (!team1Active) {
      // Команда 1 проиграла
      battle.status = BattleStatus.DEFEAT;
      battle.logs.push(`Бой завершается поражением команды 1!`);
    } else if (!team2Active) {
      // Команда 2 проиграла
      battle.status = BattleStatus.VICTORY;
      battle.logs.push(`Бой завершается победой команды 1!`);
    }
    
    // Если бой закончен, выдаем награды
    if (battle.status !== BattleStatus.ACTIVE) {
      this.handleBattleRewards(battle);
    }
  }

  private async handleBattleRewards(battle: BattleState): Promise<void> {
    // Если это PvE бой и игроки победили
    if (battle.type === BattleType.PVE && battle.status === BattleStatus.VICTORY) {
      // Выдаем опыт и добычу игрокам
      const playerParticipants = battle.participants.filter(p => p.type === 'character' && p.team === 1);
      const defeatedMonsters = battle.participants.filter(p => p.type === 'monster' && p.team === 2);
      
      // Рассчитываем общее количество опыта за монстров
      let totalExp = 0;
      for (const monster of defeatedMonsters) {
        const monsterData = await this.monsterRepository.findOne({ where: { id: monster.entityId } });
        if (monsterData) {
          totalExp += monsterData.experienceReward;
        }
      }
      
      // Делим опыт между игроками
      const expPerPlayer = Math.floor(totalExp / playerParticipants.length);
      
      // Генерируем добычу с монстров
      const loot: { itemId: number, name: string, quantity: number }[] = [];
      
      for (const monster of defeatedMonsters) {
        const monsterData = await this.monsterRepository.findOne({ where: { id: monster.entityId } });
        if (monsterData && monsterData.lootTable) {
          // В реальной системе здесь была бы сложная логика генерации лута
          // Упрощаем для примера
          for (const lootEntry of monsterData.lootTable) {
            const chance = Math.random() * 100;
            if (chance <= lootEntry.dropChance) {
              const item = await this.itemRepository.findOne({ where: { id: lootEntry.itemId } });
              if (item) {
                loot.push({
                  itemId: item.id,
                  name: item.name,
                  quantity: Math.floor(Math.random() * (lootEntry.maxQuantity - lootEntry.minQuantity + 1)) + lootEntry.minQuantity
                });
              }
            }
          }
        }
      }
      
      // Логируем награды
      battle.logs.push(`Награда: ${expPerPlayer} опыта для каждого игрока`);
      if (loot.length > 0) {
        battle.logs.push(`Добыча: ${loot.map(item => `${item.name} x${item.quantity}`).join(', ')}`);
      } else {
        battle.logs.push(`Добыча: ничего не найдено`);
      }
      
      // В реальной системе здесь был бы код для обновления персонажей и инвентаря
    }
    
    // Сохраняем лог боя в БД для истории
    await this.saveBattleLog(battle);
  }

  private async saveBattleLog(battle: BattleState): Promise<void> {
    const battleLog = new BattleLog();
    battleLog.battleId = battle.id.toString();
    battleLog.battleType = battle.type;
    battleLog.result = battle.status;
    battleLog.participants = battle.participants.map(p => ({
      id: p.id,
      type: p.type,
      entityId: p.entityId,
      name: p.name,
      team: p.team
    }));
    battleLog.log = battle.logs;
    battleLog.duration = Math.floor((new Date().getTime() - battle.startTime.getTime()) / 1000); // В секундах
    
    await this.battleLogRepository.save(battleLog);
  }

  // Вспомогательные методы
  
  private calculateInitiative(character: Character): number {
    // Инициатива зависит от характеристик
    let initiative = character.dexterity * 0.6 + character.intuition * 0.4;
    
    // Разные классы имеют разные бонусы
    switch (character.class) {
      case 'rogue':
        initiative += 10; // Разбойники быстрее
        break;
      case 'mage':
        initiative += 5; // Маги средние
        break;
      case 'warrior':
        initiative += 2; // Воины медленнее
        break;
      case 'priest':
        initiative += 3; // Жрецы тоже медленные
        break;
    }
    
    return Math.floor(initiative);
  }
  
  private calculateMonsterInitiative(monster: Monster): number {
    // Упрощенный расчет для монстров
    return monster.initiative || Math.floor(10 + monster.level * 0.5);
  }
  
  private calculateDamage(attacker: BattleParticipantState, target: BattleParticipantState, zone: 'head' | 'body' | 'waist' | 'legs'): number {
    // Базовый урон зависит от того, персонаж это или монстр
    let baseDamage = 10;
    let critChance = 5;
    let critMultiplier = 1.5;
    
    // Если атакующий - персонаж, получаем данные из репозитория
    if (attacker.type === 'character') {
      // В реальной системе здесь был бы более сложный расчет на основе оружия и характеристик
      // Для примера используем упрощенный подход
      baseDamage = 15 + Math.floor(Math.random() * 10); // 15-24 базового урона
      
      // Учитываем стойку
      if (attacker.stance === 'offensive') {
        baseDamage *= 1.2; // +20% урона в атакующей стойке
        critChance += 5; // +5% шанс крита
      } else if (attacker.stance === 'defensive') {
        baseDamage *= 0.9; // -10% урона в защитной стойке
      }
    } else {
      // Для монстров берем случайное значение в диапазоне
      baseDamage = 10 + Math.floor(Math.random() * 15); // 10-24 базового урона
    }
    
    // Учитываем зону атаки
    switch (zone) {
      case 'head':
        baseDamage *= 1.5; // +50% урона в голову
        critChance += 10; // +10% шанс крита
        break;
      case 'body':
        baseDamage *= 1.0; // Обычный урон в тело
        break;
      case 'waist':
        baseDamage *= 0.9; // -10% урона в пояс
        break;
      case 'legs':
        baseDamage *= 0.8; // -20% урона в ноги
        // Доп. эффект для ног: шанс замедления
        if (Math.random() * 100 < 25) {
          const slowEffect: BattleEffect = {
            id: Date.now(),
            name: 'Замедление',
            type: 'debuff',
            affectedStats: { initiative: -5 },
            remainingTurns: 2,
            sourceId: attacker.id
          };
          target.effects.push(slowEffect);
        }
        break;
    }
    
    // Учитываем эффекты на атакующем
    attacker.effects.forEach(effect => {
      if (effect.affectedStats.damage) {
        baseDamage += effect.affectedStats.damage;
      }
      if (effect.affectedStats.critChance) {
        critChance += effect.affectedStats.critChance;
      }
    });
    
    // Учитываем защиту цели
    let defense = 0;
    if (target.type === 'character') {
      defense = 5; // Базовая защита
    } else {
      defense = 3; // Базовая защита монстров
    }
    
    // Учитываем стойку цели
    if (target.stance === 'defensive') {
      defense += 5; // +5 защиты в защитной стойке
    } else if (target.stance === 'offensive') {
      defense -= 2; // -2 защиты в атакующей стойке
    }
    
    // Учитываем эффекты на цели
    target.effects.forEach(effect => {
      if (effect.affectedStats.defense) {
        defense += effect.affectedStats.defense;
      }
    });
    
    // Уменьшаем урон на основе защиты (но не меньше 1)
    baseDamage = Math.max(1, Math.floor(baseDamage * (1 - defense / 100)));
    
    // Проверяем на критический удар
    if (Math.random() * 100 < critChance) {
      baseDamage = Math.floor(baseDamage * critMultiplier);
      // Добавляем сообщение о критическом ударе
      return baseDamage;
    }
    
    return baseDamage;
  }
  
  private calculateSkillDamage(caster: BattleParticipantState, target: BattleParticipantState, skill: Skill): number {
    // Базовый урон умения
    let damage = skill.baseDamage || 20;
    
    // Модификаторы в зависимости от характеристик заклинателя
    // В реальной системе здесь был бы более сложный расчет
    damage += 5; // Для примера просто добавляем фиксированный бонус
    
    // Учитываем сопротивления цели
    if (skill.damageType === 'physical') {
      // Физический урон уменьшается защитой
      let defense = 0;
      // Подсчитываем защиту цели аналогично предыдущим методам
      damage = Math.max(1, Math.floor(damage * (1 - defense / 100)));
    } else if (skill.damageType === 'magical') {
      // Магический урон уменьшается магическим сопротивлением
      let magicResist = 0;
      // Подсчитываем магическое сопротивление цели
      damage = Math.max(1, Math.floor(damage * (1 - magicResist / 100)));
    }
    
    return damage;
  }
  
  private calculateHealing(caster: BattleParticipantState, skill: Skill): number {
    // Базовое лечение
    let healing = skill.baseHealing || 30;
    
    // Модификаторы в зависимости от характеристик заклинателя
    healing += 10; // Для примера просто добавляем фиксированный бонус
    
    // Бонусы от эффектов
    caster.effects.forEach(effect => {
      if (effect.affectedStats.healing) {
        healing += effect.affectedStats.healing;
      }
    });
    
    return healing;
  }
  
  private applyAdditionalEffects(battle: BattleState, source: BattleParticipantState, target: BattleParticipantState, skill: Skill): void {
    if (!skill.additionalEffects) return;
    
    for (const effect of skill.additionalEffects) {
      // Проверяем шанс применения эффекта
      if (Math.random() * 100 < effect.chance) {
        // Создаем эффект
        const battleEffect: BattleEffect = {
          id: Date.now(),
          name: effect.name,
          type: effect.type,
          affectedStats: effect.statModifiers,
          remainingTurns: effect.duration,
          sourceId: source.id
        };
        
        // Добавляем эффект цели
        target.effects.push(battleEffect);
        
        // Логируем применение эффекта
        battle.logs.push(`${source.name} накладывает эффект ${effect.name} на ${target.name}!`);
      }
    }
  }
  
  private applyEffectsAtTurnStart(battle: BattleState, participant: BattleParticipantState): void {
    // Применяем эффекты, действующие в начале хода
    for (const effect of participant.effects) {
      // Регенерация здоровья
      if (effect.affectedStats.healthRegen) {
        const regen = effect.affectedStats.healthRegen;
        participant.health = Math.min(participant.maxHealth, participant.health + regen);
        battle.logs.push(`${participant.name} восстанавливает ${regen} здоровья от эффекта ${effect.name}.`);
      }
      
      // Регенерация маны
      if (effect.affectedStats.manaRegen) {
        const regen = effect.affectedStats.manaRegen;
        participant.mana = Math.min(participant.maxMana, participant.mana + regen);
        battle.logs.push(`${participant.name} восстанавливает ${regen} маны от эффекта ${effect.name}.`);
      }
      
      // Урон от отравления или других DoT эффектов
      if (effect.affectedStats.damageOverTime) {
        const dot = effect.affectedStats.damageOverTime;
        participant.health = Math.max(0, participant.health - dot);
        battle.logs.push(`${participant.name} получает ${dot} урона от эффекта ${effect.name}.`);
        
        // Проверяем, жив ли участник
        if (participant.health <= 0) {
          participant.isActive = false;
          battle.logs.push(`${participant.name} побежден эффектом ${effect.name}!`);
        }
      }
    }
  }
  
  private getZoneName(zone: 'head' | 'body' | 'waist' | 'legs'): string {
    switch (zone) {
      case 'head': return 'голову';
      case 'body': return 'тело';
      case 'waist': return 'пояс';
      case 'legs': return 'ноги';
    }
  }
}