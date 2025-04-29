// backend/src/models/character.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { InventorySlot } from './inventory-slot.entity';
import { CharacterSkill } from './character-skill.entity';
import { CharacterQuest } from './character-quest.entity';
import { CharacterReputation } from './character-reputation.entity';
import { GuildMember } from './guild-member.entity';

export enum Faction {
  AVRELIA = 'avrelia',
  INFERNO = 'inferno'
}

export enum CharacterClass {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ROGUE = 'rogue',
  PRIEST = 'priest'
}

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.characters)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 50 })
  name: string;

  @Column({
    type: 'enum',
    enum: Faction,
  })
  faction: Faction;

  @Column({
    type: 'enum',
    enum: CharacterClass,
  })
  class: CharacterClass;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 100 })
  health: number;

  @Column({ default: 100 })
  maxHealth: number;

  @Column({ default: 100 })
  mana: number;

  @Column({ default: 100 })
  maxMana: number;

  @Column({ default: 10 })
  strength: number;

  @Column({ default: 10 })
  dexterity: number;

  @Column({ default: 10 })
  intuition: number;

  @Column({ default: 10 })
  endurance: number;

  @Column({ default: 10 })
  intelligence: number;

  @Column({ default: 10 })
  wisdom: number;

  @Column({ default: 0 })
  availableStatPoints: number;

  @Column({ default: 0 })
  availableSkillPoints: number;

  @Column({ type: 'float', default: 0 })
  xPosition: number;

  @Column({ type: 'float', default: 0 })
  yPosition: number;

  @Column({ length: 50, default: 'starting_area' })
  currentMap: string;

  @Column({ default: 100 })
  gold: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => InventorySlot, inventorySlot => inventorySlot.character)
  inventorySlots: InventorySlot[];

  @OneToMany(() => CharacterSkill, characterSkill => characterSkill.character)
  skills: CharacterSkill[];

  @OneToMany(() => CharacterQuest, characterQuest => characterQuest.character)
  quests: CharacterQuest[];

  @OneToMany(() => CharacterReputation, characterReputation => characterReputation.character)
  reputations: CharacterReputation[];

  @OneToMany(() => GuildMember, guildMember => guildMember.character)
  guildMember: GuildMember;

  // Вычисляемые свойства и методы
  getDamage(): { min: number, max: number } {
    // Базовый расчет урона на основе характеристик и класса
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

    // Учитываем уровень персонажа
    baseDamage += this.level * 0.5;

    return {
      min: Math.floor(baseDamage - damageRange / 2),
      max: Math.ceil(baseDamage + damageRange / 2)
    };
  }

  getDefense(): number {
    // Базовый расчет защиты на основе характеристик и класса
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

    // Учитываем уровень персонажа
    baseDefense += this.level * 0.3;

    return Math.floor(baseDefense);
  }

  getMagicResistance(): number {
    // Базовый расчет магического сопротивления
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

    // Учитываем уровень персонажа
    baseMagicResistance += this.level * 0.2;

    return Math.floor(baseMagicResistance);
  }

  getCriticalChance(): number {
    // Расчет шанса критического удара
    let baseCritChance = 5; // 5% базовый шанс для всех

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

    // Ограничиваем максимум 50%
    return Math.min(Math.floor(baseCritChance), 50);
  }

  getEvasionChance(): number {
    // Расчет шанса уклонения
    let baseEvasion = 3; // 3% базовый шанс для всех

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

    // Ограничиваем максимум 40%
    return Math.min(Math.floor(baseEvasion), 40);
  }

  getExpForNextLevel(): number {
    // Формула требуемого опыта для следующего уровня
    return 100 * this.level + Math.pow(this.level, 2) * 50;
  }

  addExperience(amount: number): { leveledUp: boolean, newLevel?: number } {
    const oldLevel = this.level;
    this.experience += amount;
    
    let leveledUp = false;
    
    // Проверяем, достаточно ли опыта для следующего уровня
    while (this.experience >= this.getExpForNextLevel() && this.level < 100) {
      this.level += 1;
      this.availableStatPoints += 5;
      this.availableSkillPoints += 1;
      
      // Обновляем характеристики при повышении уровня
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
}