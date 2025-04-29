
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Character } from '../models/character.entity';
import { Monster } from '../models/monster.entity';
import { Item } from '../models/item.entity';
import { Skill } from '../models/skill.entity';
import { BattleLog } from '../models/battle-log.entity';
import { Battle, BattleParticipant, BattleStatus, BattleType } from '../models/battle.entity';
import { 
  BattleState, 
  BattleParticipantState, 
  BattleAction, 
  BattleEffect, 
  SkillComplete 
} from './interfaces/battle.interfaces';

@Injectable()
export class BattlesService {
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
    @InjectRepository(BattleLog)
    private battleLogRepository: Repository<BattleLog>,
  ) {}

  async createPvEBattle(characterId: number, monsterIds: number[]): Promise<BattleState> {
    const character = await this.characterRepository.findOne({ where: { id: characterId } });
    if (!character) {
      throw new Error('Персонаж не найден');
    }

    const monsters = await this.monsterRepository.find({ 
      where: { id: In(monsterIds) } 
    });
    
    if (monsters.length !== monsterIds.length) {
      throw new Error('Некоторые монстры не найдены');
    }

    const battleId = Date.now();
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

    const characterParticipant: BattleParticipantState = {
      id: 1,
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
      team: 1,
      effects: [],
      isActive: true,
      stance: 'balanced',
    };
    battle.participants.push(characterParticipant);

    monsters.forEach((monster, index) => {
      const monsterParticipant: BattleParticipantState = {
        id: index + 2,
        type: 'monster',
        entityId: monster.id,
        name: monster.name,
        health: monster.health,
        maxHealth: monster.health,
        mana: monster.mana,
        maxMana: monster.mana,
        initiative: this.calculateMonsterInitiative(monster),
        actionPoints: 4,
        maxActionPoints: 4,
        team: 2,
        effects: [],
        isActive: true,
        stance: 'offensive',
      };
      battle.participants.push(monsterParticipant);
    });

    battle.participants.sort((a, b) => b.initiative - a.initiative);
    this.activeBattles.set(battleId, battle);

    return battle;
  }

  async createPvPBattle(characterIds: number[]): Promise<BattleState> {
    const characters = await this.characterRepository.find({
      where: { id: In(characterIds) }
    });
    
    if (characters.length !== characterIds.length) {
      throw new Error('Некоторые персонажи не найдены');
    }

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

    characters.forEach((character, index) => {
      const team = character.faction === 'avrelia' ? 1 : 2;
      
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

    battle.participants.sort((a, b) => b.initiative - a.initiative);
    this.activeBattles.set(battleId, battle);

    return battle;
  }

  async performAction(battleId: number, participantId: number, action: BattleAction): Promise<BattleState> {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Битва не найдена');
    }

    if (battle.status !== BattleStatus.ACTIVE) {
      throw new Error('Битва не активна');
    }

    const participant = battle.participants.find(p => p.id === participantId);
    if (!participant) {
      throw new Error('Участник не найден');
    }

    const currentParticipant = this.getCurrentParticipant(battle);
    if (currentParticipant.id !== participantId) {
      throw new Error('Не ваш ход');
    }

    if (participant.actionPoints < action.actionPoints) {
      throw new Error('Недостаточно очков действий');
    }

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
        throw new Error('Неизвестный тип действия');
    }

    participant.lastAction = action;
    participant.actionPoints -= action.actionPoints;
    battle.lastActionTime = new Date();

    if (participant.actionPoints <= 0 || action.type === 'flee') {
      this.endParticipantTurn(battle, participant);
    }

    this.checkBattleEnd(battle);

    return battle;
  }
  
  private getCurrentParticipant(battle: BattleState): BattleParticipantState {
    return battle.participants.find(p => p.isActive && p.actionPoints > 0) || battle.participants[0];
  }

  private endParticipantTurn(battle: BattleState, participant: BattleParticipantState): void {
    participant.effects = participant.effects.filter(effect => {
      effect.remainingTurns--;
      return effect.remainingTurns > 0;
    });
    
    const allDone = battle.participants.every(p => !p.isActive || p.actionPoints <= 0);
    
    if (allDone) {
      this.startNewTurn(battle);
    }
  }

  private startNewTurn(battle: BattleState): void {
    battle.turn += 1;
    battle.logs.push(`--- Ход ${battle.turn} ---`);
    
    battle.participants.forEach(p => {
      if (p.isActive) {
        p.actionPoints = p.maxActionPoints;
        this.applyEffectsAtTurnStart(battle, p);
      }
    });
    
    battle.participants.sort((a, b) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return b.initiative - a.initiative;
    });
  }

  private checkBattleEnd(battle: BattleState): void {
    const team1Active = battle.participants.some(p => p.isActive && p.team === 1);
    const team2Active = battle.participants.some(p => p.isActive && p.team === 2);
    
    if (!team1Active) {
      battle.status = BattleStatus.DEFEAT;
      battle.logs.push(`Бой завершается поражением команды 1!`);
    } else if (!team2Active) {
      battle.status = BattleStatus.VICTORY;
      battle.logs.push(`Бой завершается победой команды 1!`);
    }
    
    if (battle.status !== BattleStatus.ACTIVE) {
      this.handleBattleRewards(battle);
    }
  }

  private async handleBattleRewards(battle: BattleState): Promise<void> {
    if (battle.type === BattleType.PVE && battle.status === BattleStatus.VICTORY) {
      const playerParticipants = battle.participants.filter(p => p.type === 'character' && p.team === 1);
      const defeatedMonsters = battle.participants.filter(p => p.type === 'monster' && p.team === 2);
      
      let totalExp = 0;
      for (const monster of defeatedMonsters) {
        const monsterData = await this.monsterRepository.findOne({ where: { id: monster.entityId } });
        if (monsterData) {
          totalExp += monsterData.experienceReward;
        }
      }
      
      const expPerPlayer = Math.floor(totalExp / playerParticipants.length);
      
      const loot: { itemId: number, name: string, quantity: number }[] = [];
      
      for (const monster of defeatedMonsters) {
        const monsterData = await this.monsterRepository.findOne({ where: { id: monster.entityId } });
        if (monsterData && monsterData.lootTable && Array.isArray(monsterData.lootTable)) {
          const lootTable: { itemId: number; dropChance: number; minQuantity: number; maxQuantity: number }[] = monsterData.lootTable;
          for (const lootEntry of lootTable) {
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
      
      battle.logs.push(`Награда: ${expPerPlayer} опыта для каждого игрока`);
      if (loot.length > 0) {
        battle.logs.push(`Добыча: ${loot.map(item => `${item.name} x${item.quantity}`).join(', ')}`);
      } else {
        battle.logs.push(`Добыча: ничего не найдено`);
      }
    }
    
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
    battleLog.duration = Math.floor((new Date().getTime() - battle.startTime.getTime()) / 1000);
    
    await this.battleLogRepository.save(battleLog);
  }

  private calculateInitiative(character: Character): number {
    let initiative = character.dexterity * 0.6 + character.intuition * 0.4;
    
    switch (character.class) {
      case 'rogue':
        initiative += 10;
        break;
      case 'mage':
        initiative += 5;
        break;
      case 'warrior':
        initiative += 2;
        break;
      case 'priest':
        initiative += 3;
        break;
    }
    
    return Math.floor(initiative);
  }
  
  private calculateMonsterInitiative(monster: Monster): number {
    return Math.floor(10 + monster.level * 0.5);
  }

  private calculateDamage(attacker: BattleParticipantState, target: BattleParticipantState, zone: 'head' | 'body' | 'waist' | 'legs'): number {
    let baseDamage = 10;
    let critChance = 5;
    let critMultiplier = 1.5;
    
    if (attacker.type === 'character') {
      baseDamage = 15 + Math.floor(Math.random() * 10);
      if (attacker.stance === 'offensive') {
        baseDamage *= 1.2;
        critChance += 5;
      } else if (attacker.stance === 'defensive') {
        baseDamage *= 0.9;
      }
    } else {
      baseDamage = 10 + Math.floor(Math.random() * 15);
    }
    
    switch (zone) {
      case 'head':
        baseDamage *= 1.5;
        critChance += 10;
        break;
      case 'body':
        baseDamage *= 1.0;
        break;
      case 'waist':
        baseDamage *= 0.9;
        break;
      case 'legs':
        baseDamage *= 0.8;
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
    
    attacker.effects.forEach(effect => {
      if (effect.affectedStats.damage) {
        baseDamage += effect.affectedStats.damage;
      }
      if (effect.affectedStats.critChance) {
        critChance += effect.affectedStats.critChance;
      }
    });
    
    let defense = 0;
    if (target.type === 'character') {
      defense = 5;
    } else {
      defense = 3;
    }
    
    if (target.stance === 'defensive') {
      defense += 5;
    } else if (target.stance === 'offensive') {
      defense -= 2;
    }
    
    target.effects.forEach(effect => {
      if (effect.affectedStats.defense) {
        defense += effect.affectedStats.defense;
      }
    });
    
    baseDamage = Math.max(1, Math.floor(baseDamage * (1 - defense / 100)));
    
    if (Math.random() * 100 < critChance) {
      baseDamage = Math.floor(baseDamage * critMultiplier);
      return baseDamage;
    }
    
    return baseDamage;
  }
  
  private calculateSkillDamage(caster: BattleParticipantState, target: BattleParticipantState, skill: SkillComplete): number {
    let damage = skill.baseDamage || 20;
    damage += 5;
    
    if (skill.damageType === 'physical') {
      let defense = 0;
      damage = Math.max(1, Math.floor(damage * (1 - defense / 100)));
    } else if (skill.damageType === 'magical') {
      let magicResist = 0;
      damage = Math.max(1, Math.floor(damage * (1 - magicResist / 100)));
    }
    
    return damage;
  }
  
  private calculateHealing(caster: BattleParticipantState, skill: SkillComplete): number {
    let healing = skill.baseHealing || 30;
    healing += 10;
    
    caster.effects.forEach(effect => {
      if (effect.affectedStats.healing) {
        healing += effect.affectedStats.healing;
      }
    });
    
    return healing;
  }
  
  private applyAdditionalEffects(battle: BattleState, source: BattleParticipantState, target: BattleParticipantState, skill: SkillComplete): void {
    if (!skill.additionalEffects) return;
    
    for (const effect of skill.additionalEffects) {
      if (Math.random() * 100 < effect.chance) {
        const battleEffect: BattleEffect = {
          id: Date.now(),
          name: effect.name,
          type: effect.type,
          affectedStats: effect.statModifiers,
          remainingTurns: effect.duration,
          sourceId: source.id
        };
        
        target.effects.push(battleEffect);
        battle.logs.push(`${source.name} накладывает эффект ${effect.name} на ${target.name}!`);
      }
    }
  }
  
  private applyEffectsAtTurnStart(battle: BattleState, participant: BattleParticipantState): void {
    for (const effect of participant.effects) {
      if (effect.affectedStats.healthRegen) {
        const regen = effect.affectedStats.healthRegen;
        participant.health = Math.min(participant.maxHealth, participant.health + regen);
        battle.logs.push(`${participant.name} восстанавливает ${regen} здоровья от эффекта ${effect.name}.`);
      }
      
      if (effect.affectedStats.manaRegen) {
        const regen = effect.affectedStats.manaRegen;
        participant.mana = Math.min(participant.maxMana, participant.mana + regen);
        battle.logs.push(`${participant.name} восстанавливает ${regen} маны от эффекта ${effect.name}.`);
      }
      
      if (effect.affectedStats.damageOverTime) {
        const dot = effect.affectedStats.damageOverTime;
        participant.health = Math.max(0, participant.health - dot);
        battle.logs.push(`${participant.name} получает ${dot} урона от эффекта ${effect.name}.`);
        
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

  private async handleAttack(battle: BattleState, attacker: BattleParticipantState, action: BattleAction): Promise<void> {
    if (!action.targetId) {
      throw new Error('Требуется ID цели для атаки');
    }

    if (!action.targetZone) {
      throw new Error('Требуется зона атаки');
    }

    const target = battle.participants.find(p => p.id === action.targetId);
    if (!target) {
      throw new Error('Цель не найдена');
    }

    if (attacker.team === target.team) {
      throw new Error('Нельзя атаковать союзника');
    }

    if (!target.isActive) {
      throw new Error('Цель не активна');
    }

    let hitChance = 75;
    
    if (attacker.stance === 'offensive') {
      hitChance += 10;
    } else if (attacker.stance === 'defensive') {
      hitChance -= 5;
    }
    
    attacker.effects.forEach(effect => {
      if (effect.affectedStats.hitChance) {
        hitChance += effect.affectedStats.hitChance;
      }
    });
    
    switch (action.targetZone) {
      case 'head':
        hitChance -= 15;
        break;
      case 'body':
        hitChance += 5;
        break;
      case 'waist':
        break;
      case 'legs':
        hitChance -= 5;
        break;
    }

    if (target.lastAction && target.lastAction.type === 'block' && target.lastAction.blockZones) {
      if (target.lastAction.blockZones.includes(action.targetZone)) {
        hitChance -= 30;
        battle.logs.push(`${target.name} блокирует удар в ${this.getZoneName(action.targetZone)}!`);
      }
    }

    target.effects.forEach(effect => {
      if (effect.affectedStats.dodgeChance) {
        hitChance -= effect.affectedStats.dodgeChance;
      }
    });

    hitChance = Math.max(5, Math.min(95, hitChance));

    const roll = Math.random() * 100;
    const hit = roll <= hitChance;

    if (!hit) {
      battle.logs.push(`${attacker.name} промахивается по ${this.getZoneName(action.targetZone)} ${target.name}!`);
      return;
    }

    let damage = this.calculateDamage(attacker, target, action.targetZone);
    target.health = Math.max(0, target.health - damage);
    
    battle.logs.push(`${attacker.name} наносит ${damage} урона по ${this.getZoneName(action.targetZone)} ${target.name}!`);
    
    if (target.health <= 0) {
      target.isActive = false;
      battle.logs.push(`${target.name} побежден!`);
    }
  }

  private async handleSkill(battle: BattleState, caster: BattleParticipantState, action: BattleAction): Promise<void> {
    if (!action.skillId) {
      throw new Error('Требуется ID умения');
    }

    const skillRaw = await this.skillRepository.findOne({ where: { id: action.skillId } });
    if (!skillRaw) {
      throw new Error('Умение не найдено');
    }

    const skill: SkillComplete = {
      ...skillRaw,
      manaCost: skillRaw.manaCost,
      targetType: (skillRaw.effects?.targetType as 'self' | 'single' | 'aoe') || 'single',
      targetTeam: (skillRaw.effects?.targetTeam as 'enemy' | 'ally' | 'all') || 'enemy',
      effectType: (skillRaw.effects?.effectType as 'damage' | 'heal' | 'buff' | 'debuff' | 'aoe_damage') || 'damage',
      duration: skillRaw.effects?.duration || 1,
      statModifiers: skillRaw.effects?.statModifiers || {},
      additionalEffects: skillRaw.effects?.additionalEffects || [],
      damageType: skillRaw.effects?.damageType || 'physical',
      baseHealing: skillRaw.baseHealing
    };

    if (caster.mana < skill.manaCost) {
      throw new Error('Недостаточно маны');
    }

    let target: BattleParticipantState | null = null;

    if (skill.targetType !== 'self') {
      if (!action.targetId) {
        throw new Error('Требуется ID цели для этого умения');
      }
      const foundTarget = battle.participants.find(p => p.id === action.targetId);
      if (!foundTarget) {
        throw new Error('Цель не найдена');
      }
      target = foundTarget;

      if (!target.isActive) {
        throw new Error('Цель не активна');
      }

      if (skill.targetTeam === 'enemy' && target.team === caster.team) {
        throw new Error('Это умение можно применять только к врагам');
      }
      if (skill.targetTeam === 'ally' && target.team !== caster.team) {
        throw new Error('Это умение можно применять только к союзникам');
      }
    }

    caster.mana -= skill.manaCost;

    switch (skill.effectType) {
      case 'damage':
        if (!target) {
          throw new Error('Требуется цель для умения с уроном');
        }
        const damageTarget: BattleParticipantState = target;
        const damage = this.calculateSkillDamage(caster, damageTarget, skill);
        damageTarget.health = Math.max(0, damageTarget.health - damage);
        battle.logs.push(`${caster.name} использует ${skill.name} и наносит ${damage} урона ${damageTarget.name}!`);

        if (skill.additionalEffects && skill.additionalEffects.length > 0) {
          this.applyAdditionalEffects(battle, caster, damageTarget, skill);
        }

        if (damageTarget.health <= 0) {
          damageTarget.isActive = false;
          battle.logs.push(`${damageTarget.name} побежден!`);
        }
        break;

      case 'heal':
        const healTarget: BattleParticipantState = target || caster;
        const healing = this.calculateHealing(caster, skill);
        healTarget.health = Math.min(healTarget.maxHealth, healTarget.health + healing);
        battle.logs.push(`${caster.name} использует ${skill.name} и восстанавливает ${healing} здоровья ${healTarget.name === caster.name ? 'себе' : healTarget.name}!`);
        break;

      case 'buff':
        const buffTarget: BattleParticipantState = target || caster;
        if (!skill.statModifiers) {
          skill.statModifiers = {};
        }
        const buff: BattleEffect = {
          id: Date.now(),
          name: skill.name,
          type: 'buff',
          affectedStats: skill.statModifiers,
          remainingTurns: skill.duration || 1,
          sourceId: caster.id
        };
        buffTarget.effects.push(buff);
        battle.logs.push(`${caster.name} использует ${skill.name} на ${buffTarget.name === caster.name ? 'себя' : buffTarget.name}!`);
        break;

      case 'debuff':
        if (!target) {
          throw new Error('Требуется цель для умения с дебаффом');
        }
        const debuffTarget: BattleParticipantState = target;
        if (!skill.statModifiers) {
          skill.statModifiers = {};
        }
        const debuff: BattleEffect = {
          id: Date.now(),
          name: skill.name,
          type: 'debuff',
          affectedStats: skill.statModifiers,
          remainingTurns: skill.duration || 1,
          sourceId: caster.id
        };
        debuffTarget.effects.push(debuff);
        battle.logs.push(`${caster.name} использует ${skill.name} на ${debuffTarget.name}!`);
        break;

      case 'aoe_damage':
        const aoeTargets: BattleParticipantState[] = battle.participants.filter(p =>
          p.isActive &&
          (skill.targetTeam === 'enemy' ? p.team !== caster.team : p.team === caster.team)
        );

        for (const aoeTarget of aoeTargets) {
          const aoeDamage = this.calculateSkillDamage(caster, aoeTarget, skill) * 0.7;
          aoeTarget.health = Math.max(0, aoeTarget.health - aoeDamage);

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
    if (!action.itemId) {
      throw new Error('Требуется ID предмета');
    }

    const item = await this.itemRepository.findOne({ where: { id: action.itemId } });
    if (!item) {
      throw new Error('Предмет не найден');
    }

    switch (item.type) {
      case 'potion':
        let potionTarget: BattleParticipantState = user;
        if (action.targetId && action.targetId !== user.id) {
          const foundTarget = battle.participants.find(p => p.id === action.targetId);
          if (!foundTarget) {
            throw new Error('Цель не найдена');
          }
          potionTarget = foundTarget;
          
          if (item.subtype === 'healing' && potionTarget.team !== user.team) {
            throw new Error('Зелья лечения можно использовать только на союзников');
          }
        }
        
        switch (item.subtype) {
          case 'healing':
            const healing = item.attributes.healingAmount || 50;
            potionTarget.health = Math.min(potionTarget.maxHealth, potionTarget.health + healing);
            battle.logs.push(`${user.name} использует ${item.name} и восстанавливает ${healing} здоровья ${potionTarget.name === user.name ? 'себе' : potionTarget.name}!`);
            break;
            
          case 'mana':
            const manaRestore = item.attributes.manaAmount || 50;
            potionTarget.mana = Math.min(potionTarget.maxMana, potionTarget.mana + manaRestore);
            battle.logs.push(`${user.name} использует ${item.name} и восстанавливает ${manaRestore} маны ${potionTarget.name === user.name ? 'себе' : potionTarget.name}!`);
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
            potionTarget.effects.push(strengthBuff);
            battle.logs.push(`${user.name} использует ${item.name} на ${potionTarget.name === user.name ? 'себя' : potionTarget.name}!`);
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
            potionTarget.effects.push(speedBuff);
            battle.logs.push(`${user.name} использует ${item.name} на ${potionTarget.name === user.name ? 'себя' : potionTarget.name}!`);
            break;
        }
        break;
        
      case 'scroll':
        switch (item.subtype) {
          case 'attack':
            if (!action.targetId) {
              throw new Error('Требуется ID цели для атакующих свитков');
            }
            
            const scrollTarget = battle.participants.find(p => p.id === action.targetId);
            if (!scrollTarget) {
              throw new Error('Цель не найдена');
            }
            
            if (scrollTarget.team === user.team) {
              throw new Error('Нельзя использовать атакующий свиток на союзников');
            }
            
            const damage = item.attributes.damage || 100;
            scrollTarget.health = Math.max(0, scrollTarget.health - damage);
            battle.logs.push(`${user.name} использует ${item.name} и наносит ${damage} урона ${scrollTarget.name}!`);
            
            if (scrollTarget.health <= 0) {
              scrollTarget.isActive = false;
              battle.logs.push(`${scrollTarget.name} побежден!`);
            }
            break;
            
          case 'protection':
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
        if (!action.targetId) {
          throw new Error('Требуется ID цели для метательных предметов');
        }
        
        const throwableTarget = battle.participants.find(p => p.id === action.targetId);
        if (!throwableTarget) {
          throw new Error('Цель не найдена');
        }
        
        if (throwableTarget.team === user.team) {
          throw new Error('Нельзя использовать метательные предметы на союзников');
        }
        
        let throwDamage = item.attributes.damage || 30;
        
        if (throwableTarget.type === 'monster' && item.attributes.monsterTypeBonus) {
          throwDamage *= 1.5;
        }
        
        throwableTarget.health = Math.max(0, throwableTarget.health - throwDamage);
        battle.logs.push(`${user.name} бросает ${item.name} и наносит ${throwDamage} урона ${throwableTarget.name}!`);
        
        if (throwableTarget.health <= 0) {
          throwableTarget.isActive = false;
          battle.logs.push(`${throwableTarget.name} побежден!`);
        }
        break;
    }
  }

  private async handleBlock(battle: BattleState, defender: BattleParticipantState, action: BattleAction): Promise<void> {
    if (!action.blockZones || action.blockZones.length === 0) {
      throw new Error('Требуются зоны блока');
    }

    if (action.blockZones.length > 2) {
      throw new Error('Нельзя блокировать более 2 зон');
    }

    battle.logs.push(`${defender.name} готовится блокировать ${action.blockZones.map(zone => this.getZoneName(zone)).join(' и ')}!`);
    
    if (defender.stance === 'defensive') {
      const defenseBuff: BattleEffect = {
        id: Date.now(),
        name: 'Повышенная защита',
        type: 'buff',
        affectedStats: { defense: 10 },
        remainingTurns: 1,
        sourceId: defender.id
      };
      defender.effects.push(defenseBuff);
    }
  }

  private async handleFlee(battle: BattleState, participant: BattleParticipantState, action: BattleAction): Promise<void> {
    let fleeChance = 50;
    
    if (participant.stance === 'defensive') {
      fleeChance += 15;
    } else if (participant.stance === 'offensive') {
      fleeChance -= 10;
    }
    
    participant.effects.forEach(effect => {
      if (effect.affectedStats.fleeChance) {
        fleeChance += effect.affectedStats.fleeChance;
      }
    });
    
    const healthPercent = (participant.health / participant.maxHealth) * 100;
    if (healthPercent < 30) {
      fleeChance += 20;
    } else if (healthPercent < 50) {
      fleeChance += 10;
    }
    
    fleeChance = Math.max(10, Math.min(90, fleeChance));
    
    const roll = Math.random() * 100;
    
    if (roll <= fleeChance) {
      participant.isActive = false;
      battle.logs.push(`${participant.name} успешно сбегает с поля боя!`);
      
      if (battle.type === BattleType.PVE && participant.type === 'character') {
        battle.status = BattleStatus.DEFEAT;
        battle.logs.push(`Бой завершается поражением!`);
      }
    } else {
      battle.logs.push(`${participant.name} пытается сбежать, но не удаётся!`);
    }
  }
}
