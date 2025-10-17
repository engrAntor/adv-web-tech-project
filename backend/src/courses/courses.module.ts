// src/courses/courses.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './courses.entity';  // Import Course Entity
import { Progress } from '../progress/progress.entity';  // Import Progress Entity
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { User } from '../users/users.entity';  // Import User Entity
import { UsersModule } from '../users/users.module';  // Import UsersModule to access UserRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Progress, User]),  // Register entities
    UsersModule,  // Import UsersModule to access UserRepository
  ],
  providers: [CoursesService],
  controllers: [CoursesController],
})
export class CoursesModule {}
