import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  console.log('WEALTH-OS: PORT =', process.env.PORT);

  try {
    await app.listen(process.env.PORT ?? 3000);
    console.log('WEALTH-OS: listening');
  } catch (error) {
    console.error('WEALTH-OS: app.listen FAILED');
    console.error(error);
    throw error;
  }
}
await bootstrap();
