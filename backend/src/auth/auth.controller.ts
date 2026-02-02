// src/auth/auth.controller.ts
import { Controller, Post, Get, Body, Request, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

class RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

class LoginDto {
  email: string;
  password: string;
}

class ForgotPasswordDto {
  email: string;
}

class ResetPasswordDto {
  token: string;
  password: string;
}

class VerifyOTPDto {
  email: string;
  otp: string;
}

class ResendOTPDto {
  email: string;
}

class RefreshTokenDto {
  refresh_token: string;
}

class VerifyPasswordResetOTPDto {
  email: string;
  otp: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.firstName, dto.lastName);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Email verification endpoints
  @Post('verify-email-otp')
  async verifyEmailOTP(@Body() dto: VerifyOTPDto) {
    return this.authService.verifyEmailWithOTP(dto.email, dto.otp);
  }

  @Post('resend-verification-otp')
  async resendVerificationOTP(@Body() dto: ResendOTPDto) {
    return this.authService.resendEmailVerificationOTP(dto.email);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // Password reset endpoints
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('verify-reset-otp')
  async verifyPasswordResetOTP(@Body() dto: VerifyPasswordResetOTPDto) {
    return this.authService.verifyPasswordResetOTP(dto.email, dto.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.id);
    if (user) {
      const { password, passwordResetToken, emailVerificationToken, passwordResetExpires, passwordResetOTP, emailVerificationOTP, emailVerificationExpires, ...result } = user;
      return result;
    }
    return null;
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(@Request() req: any) {
    const user = await this.authService.validateUser(req.user.id);
    if (user) {
      return this.authService.refreshToken(user);
    }
    return null;
  }

  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refresh_token);
  }
}
