// src/users/users.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';  // Import User Entity
import { UsersService } from './users.service';  // Import Users Service
import { UsersController } from './users.controller';  // Import Users Controller

@Module({
  imports: [TypeOrmModule.forFeature([User])],  // Register User entity
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],  // Export UsersService so it can be used in other modules like AuthModule
})
export class UsersModule {}
