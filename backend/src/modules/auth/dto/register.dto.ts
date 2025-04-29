import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3, { message: 'Имя пользователя должно содержать не менее 3 символов' })
  @MaxLength(20, { message: 'Имя пользователя должно содержать не более 20 символов' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Имя пользователя может содержать только буквы, цифры, символы _ и -' })
  username: string;

  @IsEmail({}, { message: 'Пожалуйста, введите корректный email' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру',
  })
  password: string;
}