// online-learning-platform-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- THIS IS THE ROBUST CORS CONFIGURATION ---
  app.enableCors({
    // The origin MUST be the exact address of your running frontend
    origin: 'http://localhost:3001', 
    
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
  console.log(`✅ NestJS Backend is running on: http://localhost:3000`);
  console.log(`✅ Accepting requests from: http://localhost:3001`);
}
bootstrap();