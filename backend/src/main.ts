// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Префикс API
  app.setGlobalPrefix('api');
  
  // Валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет неопределенные свойства
      transform: true, // Автоматическое преобразование типов
      forbidNonWhitelisted: true, // Запрещает неопределенные свойства
    }),
  );
  
  // CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`Приложение запущено на порту: ${port}`);
}
bootstrap();