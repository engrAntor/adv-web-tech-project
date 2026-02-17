// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./users.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async createUser(email: string, password: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new BadRequestException("Email already exists");
    }

    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }

  async updateProfile(
    id: number,
    data: Partial<{
      firstName: string;
      lastName: string;
      bio: string;
      phone: string;
      avatar: string;
    }>,
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.userRepository.update(id, data);
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }

  async updatePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }

  async updateAvatar(id: number, avatar: string): Promise<User> {
    await this.userRepository.update(id, { avatar });
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Password Reset OTP Methods
  async setPasswordResetOTP(
    email: string,
  ): Promise<{ otp: string; user: User }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.userRepository.update(user.id, {
      passwordResetOTP: otp,
      passwordResetExpires: expires,
    });

    return { otp, user };
  }

  async verifyPasswordResetOTP(email: string, otp: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Invalid email");
    }

    if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
      throw new BadRequestException("Invalid OTP");
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException("OTP has expired");
    }

    // Generate a reset token for the actual password reset
    const token =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    await this.userRepository.update(user.id, {
      passwordResetToken: token,
      passwordResetOTP: null as any,
    });

    return token;
  }

  async resetPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { passwordResetToken: token },
    });

    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null as any,
      passwordResetExpires: null as any,
      passwordResetOTP: null as any,
    });
  }

  // Legacy method for backwards compatibility
  async setPasswordResetToken(email: string): Promise<string> {
    const { otp } = await this.setPasswordResetOTP(email);
    return otp;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.resetPasswordWithToken(token, newPassword);
  }

  // Email Verification OTP Methods
  async setEmailVerificationOTP(userId: number): Promise<string> {
    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.userRepository.update(userId, {
      emailVerificationOTP: otp,
      emailVerificationExpires: expires,
    });

    return otp;
  }

  async verifyEmailWithOTP(email: string, otp: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new BadRequestException("Invalid email");
    }

    if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
      throw new BadRequestException("Invalid OTP");
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException("OTP has expired");
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationOTP: null as any,
      emailVerificationExpires: null as any,
      emailVerificationToken: null as any,
    });
  }

  async resendEmailVerificationOTP(
    email: string,
  ): Promise<{ otp: string; user: User }> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email is already verified");
    }

    const otp = await this.setEmailVerificationOTP(user.id);
    return { otp, user };
  }

  // Legacy methods for backwards compatibility
  async setEmailVerificationToken(userId: number): Promise<string> {
    return this.setEmailVerificationOTP(userId);
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException("Invalid verification token");
    }

    await this.userRepository.update(user.id, {
      isEmailVerified: true,
      emailVerificationToken: null as any,
      emailVerificationOTP: null as any,
      emailVerificationExpires: null as any,
    });
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    await this.userRepository.update(id, { role });
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }

  async findAll(
    limit = 20,
    offset = 0,
    search?: string,
    role?: UserRole,
  ): Promise<{ users: User[]; total: number }> {
    const query = this.userRepository.createQueryBuilder("user");

    if (search) {
      query.where(
        "user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search",
        { search: `%${search}%` },
      );
    }

    if (role) {
      query.andWhere("user.role = :role", { role });
    }

    const [users, total] = await query
      .orderBy("user.createdAt", "DESC")
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { users, total };
  }

  async toggleActive(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.userRepository.update(id, { isActive: !user.isActive });
    return this.userRepository.findOneBy({ id }) as Promise<User>;
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getInstructors(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.INSTRUCTOR, isActive: true },
      select: ["id", "email", "firstName", "lastName", "avatar", "bio"],
    });
  }
}
