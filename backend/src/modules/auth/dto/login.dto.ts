import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Пожалуйста, введите email или имя пользователя' })
  emailOrUsername: string;

  @IsString()
  @IsNotEmpty({ message: 'Пожалуйста, введите пароль' })
  password: string;
}