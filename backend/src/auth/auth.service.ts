// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "../email/email.service";
import * as bcrypt from "bcrypt";
import { User } from "../users/users.entity";
import { TokenResponse } from "./types";

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
  type?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
  ): Promise<{
    message: string;
    email: string;
    requiresVerification: boolean;
  }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.createUser(email, hashedPassword);

    // Update user with first and last name if provided
    if (firstName || lastName) {
      await this.usersService.updateProfile(newUser.id, {
        firstName,
        lastName,
      });
    }

    // Generate email verification OTP and send email
    const otp = await this.usersService.setEmailVerificationOTP(newUser.id);
    await this.emailService.sendEmailVerification(email, otp);

    return {
      message:
        "Registration successful. Please check your email for verification OTP.",
      email: newUser.email,
      requiresVerification: true,
    };
  }

  async login(email: string, password: string): Promise<TokenResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is deactivated");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Resend verification OTP
      const otp = await this.usersService.setEmailVerificationOTP(user.id);
      await this.emailService.sendEmailVerification(email, otp);

      throw new UnauthorizedException({
        message:
          "Email not verified. A new verification OTP has been sent to your email.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    return this.generateToken(user);
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const { otp } = await this.usersService.setPasswordResetOTP(email);
      await this.emailService.sendOTP(email, otp);
      return { message: "Password reset OTP has been sent to your email." };
    } catch {
      // Return same message even if email doesn't exist (security best practice)
      return {
        message: "If the email exists, a password reset OTP has been sent.",
      };
    }
  }

  async verifyPasswordResetOTP(
    email: string,
    otp: string,
  ): Promise<{ token: string; message: string }> {
    const token = await this.usersService.verifyPasswordResetOTP(email, otp);
    return { token, message: "OTP verified successfully." };
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    await this.usersService.resetPasswordWithToken(token, newPassword);
    return { message: "Password has been reset successfully." };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    await this.usersService.verifyEmail(token);
    return { message: "Email verified successfully." };
  }

  async verifyEmailWithOTP(
    email: string,
    otp: string,
  ): Promise<TokenResponse | { message: string }> {
    await this.usersService.verifyEmailWithOTP(email, otp);
    const user = await this.usersService.findByEmail(email);

    if (user) {
      // Send welcome email
      await this.emailService.sendWelcomeEmail(email, user.firstName || "");
      return this.generateToken(user);
    }

    return { message: "Email verified successfully." };
  }

  async resendEmailVerificationOTP(
    email: string,
  ): Promise<{ message: string }> {
    try {
      const { otp } = await this.usersService.resendEmailVerificationOTP(email);
      await this.emailService.sendEmailVerification(email, otp);
      return { message: "Verification OTP has been sent to your email." };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      return {
        message: "If the email exists, a verification OTP has been sent.",
      };
    }
  }

  refreshToken(user: User): TokenResponse {
    return this.generateToken(user);
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private generateToken(user: User): TokenResponse {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    // Access token - short lived (15 minutes)
    const access_token = this.jwtService.sign(payload, { expiresIn: "15m" });

    // Refresh token - long lived (7 days)
    const refresh_token = this.jwtService.sign(
      { sub: user.id, type: "refresh" },
      { expiresIn: "7d" },
    );

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      // Ensure it's a refresh token
      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException("User not found or inactive");
      }

      // Generate new tokens
      return this.generateToken(user);
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }
}
