import { Controller, Post, Body, Get, Param, UseGuards, Req } from '@nestjs/common';
import { BattleService } from './battles.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('battles')
@UseGuards(JwtAuthGuard)
export class BattlesController {
  constructor(private readonly battlesService: BattleService) {}

  @Post('pve')
  async createPvEBattle(
    @Body() body: { characterId: number; monsterIds: number[] },
    @Req() req: Request,
  ) {
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
  ) {
    // Здесь также можно добавить проверки на доступ к персонажам
    return this.battlesService.createPvPBattle(
      body.characterIds,
    );
  }

  @Post('action/:battleId')
  async performAction(
    @Param('battleId') battleId: string,
    @Body() body: { participantId: number; action: any },
    @Req() req: Request,
  ) {
    return this.battlesService.performAction(
      +battleId,
      body.participantId,
      body.action,
    );
  }
}