// src/ratings/ratings.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { RatingsService } from "./ratings.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";

@Controller("ratings")
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() body: { courseId: number; rating: number; review?: string },
  ) {
    return this.ratingsService.create(
      req.user.id,
      body.courseId,
      body.rating,
      body.review,
    );
  }

  @Get("course/:courseId")
  async findByCourse(
    @Param("courseId") courseId: number,
    @Query("limit") limit = 10,
    @Query("offset") offset = 0,
  ) {
    return this.ratingsService.findByCourse(+courseId, +limit, +offset);
  }

  @Get("my-ratings")
  @UseGuards(JwtAuthGuard)
  async findMyRatings(@Request() req: any) {
    return this.ratingsService.findByUser(req.user.id);
  }

  @Get("user-course/:courseId")
  @UseGuards(JwtAuthGuard)
  async getUserCourseRating(
    @Request() req: any,
    @Param("courseId") courseId: number,
  ) {
    return this.ratingsService.getUserCourseRating(req.user.id, +courseId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  async delete(@Param("id") id: number, @Request() req: any) {
    await this.ratingsService.delete(+id, req.user.id);
    return { success: true };
  }

  @Patch(":id/moderate")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async moderate(
    @Param("id") id: number,
    @Body() body: { isApproved: boolean },
  ) {
    return this.ratingsService.moderate(+id, body.isApproved);
  }
}
