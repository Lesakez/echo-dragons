// src/battles/battles.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BattlesService } from './battles.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { BattleState, BattleAction } from './interfaces/battle.interfaces';

@Controller('battles')
@UseGuards(JwtAuthGuard)
export class BattlesController {
  constructor(private readonly battlesService: BattlesService) {}

  @Post('pve')
  async createPvEBattle(
    @Body() body: { characterId: number; monsterIds: number[] },
    @Req() req: Request,
  ): Promise<BattleState> {
    // Можно добавить проверку, что персонаж принадлежит текущему пользователю
    return this.battlesService.createPvEBattle(
      body.characterId,
      body.monsterIds,
    );
  }

  @Post('pvp')
  async createPvPBattle(
    @Body() body: { characterIds: number[] },
    @Req() req: Request,
  ): Promise<BattleState> {
    // Здесь также можно добавить проверки на доступ к персонажам
    return this.battlesService.createPvPBattle(
      body.characterIds,
    );
  }

  @Post('action/:battleId')
  async performAction(
    @Param('battleId') battleId: string,
    @Body() body: { participantId: number; action: BattleAction },
    @Req() req: Request,
  ): Promise<BattleState> {
    return this.battlesService.performAction(
      +battleId,
      body.participantId,
      body.action,
    );
  }
}