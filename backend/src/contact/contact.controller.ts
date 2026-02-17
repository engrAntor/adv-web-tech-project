// src/contact/contact.controller.ts
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
} from "@nestjs/common";
import { ContactService } from "./contact.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";
import { ContactStatus } from "./contact.entity";

@Controller("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(
    @Body()
    body: { name: string; email: string; subject: string; message: string },
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.contactService.create(
      body.name,
      body.email,
      body.subject,
      body.message,
      userId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async findAll(
    @Query("status") status?: ContactStatus,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    return this.contactService.findAll(status, +limit, +offset);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async findOne(@Param("id") id: number) {
    return this.contactService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async updateStatus(
    @Param("id") id: number,
    @Body() body: { status: ContactStatus; adminResponse?: string },
  ) {
    return this.contactService.updateStatus(
      +id,
      body.status,
      body.adminResponse,
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async delete(@Param("id") id: number) {
    await this.contactService.delete(+id);
    return { success: true };
  }
}
