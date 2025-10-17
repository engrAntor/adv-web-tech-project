// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';  // Import UsersModule
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule for JWT functionality

@Module({
  imports: [
    UsersModule,  // Import UsersModule to access UsersService
    JwtModule.register({
      secret: 'your-jwt-secret',  // Replace with your actual secret key
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
