import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../models/user.entity';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('character/:characterId')
  async getCharacterInventory(@Param('characterId') characterId: string, @Req() req: Request) {
    const user = req.user as User; // Теперь TypeScript знает, что user — это User
    return this.inventoryService.getCharacterInventory(+characterId, user.id);
  }

  @Post('character/:characterId/equip')
  async equipItem(
    @Param('characterId') characterId: string,
    @Body() body: { inventorySlotId: number; equipSlotType: string },
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.inventoryService.equipItem(
      +characterId,
      user.id,
      body.inventorySlotId,
      body.equipSlotType,
    );
  }

  @Post('character/:characterId/unequip')
  async unequipItem(
    @Param('characterId') characterId: string,
    @Body() body: { equipSlotType: string },
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.inventoryService.unequipItem(
      +characterId,
      user.id,
      body.equipSlotType,
    );
  }

  @Post('character/:characterId/use')
  async useItem(
    @Param('characterId') characterId: string,
    @Body() body: { inventorySlotId: number },
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.inventoryService.useItem(
      +characterId,
      user.id,
      body.inventorySlotId,
    );
  }

  @Post('character/:characterId/move')
  async moveItem(
    @Param('characterId') characterId: string,
    @Body() body: { fromSlotIndex: number; toSlotIndex: number },
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.inventoryService.moveItem(
      +characterId,
      user.id,
      body.fromSlotIndex,
      body.toSlotIndex,
    );
  }

  @Delete('character/:characterId/item/:inventorySlotId')
  async deleteItem(
    @Param('characterId') characterId: string,
    @Param('inventorySlotId') inventorySlotId: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.inventoryService.deleteItem(
      +characterId,
      user.id,
      +inventorySlotId,
    );
  }
}