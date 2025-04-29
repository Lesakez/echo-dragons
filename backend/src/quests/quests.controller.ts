// src/quests/quests.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Param, 
    Body, 
    UseGuards, 
    Req
  } from '@nestjs/common';
  import { QuestsService } from './quests.service';
  import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
  import { Request } from 'express';
  
  @Controller('quests')
  @UseGuards(JwtAuthGuard)
  export class QuestsController {
    constructor(private readonly questsService: QuestsService) {}
  
    @Get()
    async getAllQuests() {
      return this.questsService.getAllQuests();
    }
  
    @Get('character/:characterId')
    async getCharacterQuests(@Param('characterId') characterId: string, @Req() req: Request) {
      const user = req.user as any;
      return this.questsService.getCharacterQuests(+characterId, user.id);
    }
  
    @Get('available/:characterId')
    async getAvailableQuests(@Param('characterId') characterId: string, @Req() req: Request) {
      const user = req.user as any;
      return this.questsService.getAvailableQuests(+characterId, user.id);
    }
  
    @Post('accept/:characterId')
    async acceptQuest(
      @Param('characterId') characterId: string,
      @Body() body: { questId: number },
      @Req() req: Request
    ) {
      const user = req.user as any;
      return this.questsService.acceptQuest(+characterId, user.id, body.questId);
    }
  
    @Post('complete/:characterId')
    async completeQuest(
      @Param('characterId') characterId: string,
      @Body() body: { characterQuestId: number },
      @Req() req: Request
    ) {
      const user = req.user as any;
      return this.questsService.completeQuest(+characterId, user.id, body.characterQuestId);
    }
  
    @Post('abandon/:characterId')
    async abandonQuest(
      @Param('characterId') characterId: string,
      @Body() body: { characterQuestId: number },
      @Req() req: Request
    ) {
      const user = req.user as any;
      return this.questsService.abandonQuest(+characterId, user.id, body.characterQuestId);
    }
  
    @Get('npc/:npcId')
    async getNpcQuests(@Param('npcId') npcId: string) {
      return this.questsService.getNpcQuests(+npcId);
    }
  }