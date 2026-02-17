// src/courses/courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CoursesService } from "./courses.service";
import { Course, CourseCategory, CourseDifficulty } from "./courses.entity";
import { Progress } from "../progress/progress.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";

@Controller("courses")
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query("category") category?: CourseCategory,
    @Query("difficulty") difficulty?: CourseDifficulty,
    @Query("search") search?: string,
    @Query("minRating") minRating?: number,
    @Query("isFree") isFree?: string,
    @Query("instructorId") instructorId?: number,
    @Query("limit") limit = 20,
    @Query("offset") offset = 0,
  ) {
    return this.coursesService.findAll(
      {
        category,
        difficulty,
        search,
        minRating: minRating ? +minRating : undefined,
        isFree:
          isFree === "true" ? true : isFree === "false" ? false : undefined,
        instructorId: instructorId ? +instructorId : undefined,
      },
      +limit,
      +offset,
    );
  }

  @Get("categories")
  async getCategories() {
    return this.coursesService.getCategories();
  }

  @Get("difficulties")
  async getDifficulties() {
    return this.coursesService.getDifficulties();
  }

  @Get("popular")
  async getPopular(@Query("limit") limit = 10) {
    return this.coursesService.getPopularCourses(+limit);
  }

  @Get("top-rated")
  async getTopRated(@Query("limit") limit = 10) {
    return this.coursesService.getTopRatedCourses(+limit);
  }

  @Get("my-courses")
  @UseGuards(JwtAuthGuard)
  async getMyCourses(@Request() req: any): Promise<Progress[]> {
    const user = await this.coursesService.findUserById(req.user.id);
    return this.coursesService.getProgress(user);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.coursesService.findById(+id);
  }

  @Get(":id/progress")
  @UseGuards(JwtAuthGuard)
  async getCourseProgress(@Param("id") id: number, @Request() req: any) {
    return this.coursesService.getUserProgress(req.user.id, +id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(
    @Body()
    body: {
      title: string;
      description: string;
      syllabus?: string;
      thumbnail?: string;
      category?: CourseCategory;
      difficulty?: CourseDifficulty;
      duration?: number;
      price?: number;
    },
    @Request() req: any,
  ): Promise<Course> {
    return this.coursesService.createCourse({
      ...body,
      instructorId:
        req.user.role === UserRole.INSTRUCTOR ? req.user.id : undefined,
    });
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async update(@Param("id") id: number, @Body() body: Partial<Course>) {
    return this.coursesService.updateCourse(+id, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param("id") id: number) {
    await this.coursesService.deleteCourse(+id);
    return { success: true };
  }

  @Post(":id/enroll")
  @UseGuards(JwtAuthGuard)
  async enroll(
    @Param("id") id: number,
    @Request() req: any,
  ): Promise<Progress> {
    return this.coursesService.enrollUser(req.user.id, +id);
  }

  @Patch(":id/progress")
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Param("id") id: number,
    @Request() req: any,
    @Body() body: { completionPercentage: number },
  ) {
    return this.coursesService.updateProgress(
      req.user.id,
      +id,
      body.completionPercentage,
    );
  }

  // Legacy endpoints for backwards compatibility
  @Get(":userId/progress")
  async getProgress(@Param("userId") userId: number): Promise<Progress[]> {
    const user = await this.coursesService.findUserById(+userId);
    return this.coursesService.getProgress(user);
  }

  @Post(":userId/enroll/:courseId")
  async enrollUser(
    @Param("userId") userId: number,
    @Param("courseId") courseId: number,
  ): Promise<Progress> {
    return this.coursesService.enrollUser(+userId, +courseId);
  }

  @Post("create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async createCourse(
    @Body() body: { title: string; description: string },
  ): Promise<Course> {
    return this.coursesService.createCourse(body);
  }
}
