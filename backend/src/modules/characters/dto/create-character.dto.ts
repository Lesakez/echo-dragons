// src/modules/characters/dto/create-character.dto.ts
import { IsString, IsNotEmpty, IsIn, Length } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя персонажа обязательно' })
  @Length(3, 50, { message: 'Имя персонажа должно содержать от 3 до 50 символов' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Фракция обязательна' })
  @IsIn(['avrelia', 'inferno'], { message: 'Фракция должна быть либо "avrelia", либо "inferno"' })
  faction: string;

  @IsString()
  @IsNotEmpty({ message: 'Класс персонажа обязателен' })
  @IsIn(['warrior', 'mage', 'rogue', 'priest'], { message: 'Недопустимый класс персонажа' })
  class: string;
}