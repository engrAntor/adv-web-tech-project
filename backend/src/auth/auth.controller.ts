// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { User } from "../users/users.entity";
import { AuthenticatedRequest, TokenResponse } from "./types";

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

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: RegisterDto): Promise<{
    message: string;
    email: string;
    requiresVerification: boolean;
  }> {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
    );
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto.email, dto.password);
  }

  // Email verification endpoints
  @Post("verify-email-otp")
  async verifyEmailOTP(
    @Body() dto: VerifyOTPDto,
  ): Promise<TokenResponse | { message: string }> {
    return this.authService.verifyEmailWithOTP(dto.email, dto.otp);
  }

  @Post("resend-verification-otp")
  async resendVerificationOTP(
    @Body() dto: ResendOTPDto,
  ): Promise<{ message: string }> {
    return this.authService.resendEmailVerificationOTP(dto.email);
  }

  @Get("verify-email")
  async verifyEmail(
    @Query("token") token: string,
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  // Password reset endpoints
  @Post("forgot-password")
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("verify-reset-otp")
  async verifyPasswordResetOTP(
    @Body() dto: VerifyPasswordResetOTPDto,
  ): Promise<{ token: string; message: string }> {
    return this.authService.verifyPasswordResetOTP(dto.email, dto.otp);
  }

  @Post("reset-password")
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(
    @Request() req: AuthenticatedRequest,
  ): Promise<Partial<User> | null> {
    const user = await this.authService.validateUser(req.user.id);
    if (user) {
      const { id, email, firstName, lastName, role, avatar, isEmailVerified } =
        user;
      return {
        id,
        email,
        firstName,
        lastName,
        role,
        avatar,
        isEmailVerified,
      };
    }
    return null;
  }

  @Post("refresh")
  @UseGuards(JwtAuthGuard)
  async refresh(
    @Request() req: AuthenticatedRequest,
  ): Promise<TokenResponse | null> {
    const user = await this.authService.validateUser(req.user.id);
    if (user) {
      return this.authService.refreshToken(user);
    }
    return null;
  }

  @Post("refresh-token")
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshAccessToken(dto.refresh_token);
  }
}
