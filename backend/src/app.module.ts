// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/courses.entity';  // Import Course Entity
import { Progress } from './progress/progress.entity';  // Import Progress Entity
import { User } from './users/users.entity';  // Import User Entity
import { QuestionModule } from './question/question.module';
import { Certificate } from './certificates/certificate.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  // Ensure environment variables are globally available
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),  // Ensure DB_PORT is set in .env
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Course, Progress, User,Certificate],  // Register entities here
      synchronize: true,  // Automatically sync the schema (use false in production)
      
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    QuestionModule,
  ],
})
export class AppModule {}