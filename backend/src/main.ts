// online-learning-platform-backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  let app: NestExpressApplication;

  // Only use HTTPS in development (when certificates exist)
  if (!isProduction) {
    const certPath = join(process.cwd(), 'certificates', 'localhost-key.pem');
    if (fs.existsSync(certPath)) {
      const httpsOptions = {
        key: fs.readFileSync(join(process.cwd(), 'certificates', 'localhost-key.pem')),
        cert: fs.readFileSync(join(process.cwd(), 'certificates', 'localhost.pem')),
      };
      app = await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions,
      });
    } else {
      app = await NestFactory.create<NestExpressApplication>(AppModule);
    }
  } else {
    // In production, Render handles HTTPS - we just run HTTP
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  }

  // Serve static files from uploads directory
  const uploadsPath = join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadsPath)) {
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
    });
  }

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3001',
    'https://localhost:3001',
  ];

  // Add production frontend URL if set
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  app.enableCors({
    origin: isProduction ? (process.env.CORS_ORIGIN || allowedOrigins) : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  const protocol = isProduction ? 'http' : 'https';
  console.log(`✅ NestJS Backend is running on: ${protocol}://localhost:${port}`);
  console.log(`✅ Environment: ${isProduction ? 'production' : 'development'}`);
}
bootstrap();