// src/modules/characters/characters.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    UseGuards, 
    Req 
  } from '@nestjs/common';
  import { CharactersService } from './characters.service';
  import { CreateCharacterDto } from './dto/create-character.dto';
  import { UpdateCharacterDto } from './dto/update-character.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { Request } from 'express';
  
  @Controller('characters')
  @UseGuards(JwtAuthGuard)
  export class CharactersController {
    constructor(private readonly charactersService: CharactersService) {}
  
    @Post()
    create(@Body() createCharacterDto: CreateCharacterDto, @Req() req: Request) {
      const user = req.user as any;
      return this.charactersService.create(user.id, createCharacterDto);
    }
  
    @Get()
    findAll(@Req() req: Request) {
      const user = req.user as any;
      return this.charactersService.findAllByUser(user.id);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request) {
      const user = req.user as any;
      return this.charactersService.findOne(+id, user.id);
    }
  
    @Put(':id')
    update(
      @Param('id') id: string,
      @Body() updateCharacterDto: UpdateCharacterDto,
      @Req() req: Request
    ) {
      const user = req.user as any;
      return this.charactersService.update(+id, user.id, updateCharacterDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request) {
      const user = req.user as any;
      return this.charactersService.remove(+id, user.id);
    }
  }