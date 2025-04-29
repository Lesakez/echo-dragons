import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Character } from '../models/character.entity';
import { InventorySlot } from '../models/inventory-slot.entity';
import { Item } from '../models/item.entity';
import { ItemModification } from '../models/item-modification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Character,
      InventorySlot,
      Item,
      ItemModification
    ])
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}