// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "./users.entity";

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), "uploads", "avatars");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findById(req.user.id);
    if (user) {
      const {
        password,
        passwordResetToken,
        emailVerificationToken,
        ...result
      } = user;
      return result;
    }
    return null;
  }

  @Patch("profile")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Request() req: any,
    @Body()
    body: {
      firstName?: string;
      lastName?: string;
      bio?: string;
      phone?: string;
    },
  ) {
    const user = await this.usersService.updateProfile(req.user.id, body);
    const { password, passwordResetToken, emailVerificationToken, ...result } =
      user;
    return result;
  }

  @Patch("password")
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Request() req: any,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    await this.usersService.updatePassword(
      req.user.id,
      body.currentPassword,
      body.newPassword,
    );
    return { success: true, message: "Password updated successfully" };
  }

  @Patch("avatar")
  @UseGuards(JwtAuthGuard)
  async updateAvatar(@Request() req: any, @Body() body: { avatar: string }) {
    const user = await this.usersService.updateAvatar(req.user.id, body.avatar);
    const { password, passwordResetToken, emailVerificationToken, ...result } =
      user;
    return result;
  }

  @Post("avatar/upload")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const userId = (req as any).user?.id || "unknown";
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException("Only image files are allowed!"),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    // Generate the URL for the uploaded file
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update the user's avatar in the database
    const user = await this.usersService.updateAvatar(req.user.id, avatarUrl);
    const { password, passwordResetToken, emailVerificationToken, ...result } =
      user;

    return {
      ...result,
      avatarUrl,
    };
  }

  @Get("instructors")
  async getInstructors() {
    return this.usersService.getInstructors();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: number) {
    const user = await this.usersService.findById(+id);
    if (user) {
      const {
        password,
        passwordResetToken,
        emailVerificationToken,
        passwordResetExpires,
        ...result
      } = user;
      return result;
    }
    return null;
  }

  // Admin & Advisor endpoints
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async findAll(
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
    @Query("search") search?: string,
    @Query("role") role?: UserRole,
  ) {
    return this.usersService.findAll(+limit, +offset, search, role);
  }

  @Patch(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async updateRole(@Param("id") id: number, @Body() body: { role: UserRole }) {
    return this.usersService.updateRole(+id, body.role);
  }

  @Patch(":id/toggle-active")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async toggleActive(@Param("id") id: number) {
    return this.usersService.toggleActive(+id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async delete(@Param("id") id: number) {
    await this.usersService.deleteUser(+id);
    return { success: true };
  }
}
