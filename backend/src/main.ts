// online-learning-platform-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // HTTPS configuration
  const httpsOptions = {
    key: fs.readFileSync(join(process.cwd(), 'certificates', 'localhost-key.pem')),
    cert: fs.readFileSync(join(process.cwd(), 'certificates', 'localhost.pem')),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // --- THIS IS THE ROBUST CORS CONFIGURATION ---
  app.enableCors({
    // The origin MUST be the exact address of your running frontend
    // Allow both HTTP and HTTPS for development
    origin: ['http://localhost:3001', 'https://localhost:3001'],

    // These are the HTTP methods your frontend is allowed to use
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',

    // This allows the browser to send cookies and authorization headers
    credentials: true,

    // This tells the browser which headers are allowed in the request
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // --- END OF FIX ---

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
  console.log(`✅ NestJS Backend is running on: https://localhost:3000`);
  console.log(`✅ Accepting requests from: https://localhost:3001`);
}
bootstrap();