import 'reflect-metadata';
import 'dotenv/config';

import express from 'express';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

const server = express();

const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

const config = new DocumentBuilder()
  .setTitle('Wealth OS')
  .setDescription('Wealth OS API')
  .setVersion('1.0')
  .addTag('wealth-os')
  .build();

const document = SwaggerModule.createDocument(app, config);

SwaggerModule.setup('api', app, document);

await app.init();

export default server;
