// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';  // Import AuthService

class AuthDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Register new user
  @Post('register')
  async register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto.email, authDto.password);  // Call register method from AuthService
  }

  // Login user
  @Post('login')
  async login(@Body() authDto: AuthDto) {
    return this.authService.login(authDto.email, authDto.password);  // Call login method from AuthService
  }
}
