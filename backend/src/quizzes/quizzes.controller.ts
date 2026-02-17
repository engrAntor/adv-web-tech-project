// src/quizzes/quizzes.controller.ts
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
import { QuizzesService } from "./quizzes.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";

@Controller("quizzes")
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get()
  async findAll() {
    return this.quizzesService.findAllQuizzes();
  }

  @Get("instructor")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR)
  async findByInstructor(@Request() req: any) {
    return this.quizzesService.findAllQuizzesForInstructor(req.user.id);
  }

  @Get("admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async findAllAdmin() {
    return this.quizzesService.findAllQuizzesAdmin();
  }

  @Get("course/:courseId")
  async findByCourse(@Param("courseId") courseId: number) {
    return this.quizzesService.findQuizzesByCourse(+courseId);
  }

  @Get(":id")
  async findById(@Param("id") id: number) {
    return this.quizzesService.findQuizById(+id);
  }

  @Get(":id/stats")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async getStats(@Param("id") id: number) {
    return this.quizzesService.getQuizStats(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async create(
    @Body()
    body: {
      courseId: number;
      title: string;
      description?: string;
      timeLimit?: number;
      passingScore?: number;
    },
  ) {
    return this.quizzesService.createQuiz(
      body.courseId,
      body.title,
      body.description,
      body.timeLimit,
      body.passingScore,
    );
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async update(
    @Param("id") id: number,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      timeLimit: number;
      passingScore: number;
      isPublished: boolean;
    }>,
  ) {
    return this.quizzesService.updateQuiz(+id, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async delete(@Param("id") id: number) {
    await this.quizzesService.deleteQuiz(+id);
    return { success: true };
  }

  // Question endpoints
  @Post(":quizId/questions")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async addQuestion(
    @Param("quizId") quizId: number,
    @Body()
    body: {
      content: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      points?: number;
    },
  ) {
    return this.quizzesService.addQuestion(
      +quizId,
      body.content,
      body.options,
      body.correctAnswer,
      body.explanation,
      body.points,
    );
  }

  @Patch("questions/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async updateQuestion(
    @Param("id") id: number,
    @Body()
    body: Partial<{
      content: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      points: number;
    }>,
  ) {
    return this.quizzesService.updateQuestion(+id, body);
  }

  @Delete("questions/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async deleteQuestion(@Param("id") id: number) {
    await this.quizzesService.deleteQuestion(+id);
    return { success: true };
  }

  // Attempt endpoints
  @Post(":quizId/start")
  @UseGuards(JwtAuthGuard)
  async startAttempt(@Param("quizId") quizId: number, @Request() req: any) {
    return this.quizzesService.startAttempt(req.user.id, +quizId);
  }

  @Post("attempts/:attemptId/submit")
  @UseGuards(JwtAuthGuard)
  async submitAttempt(
    @Param("attemptId") attemptId: number,
    @Request() req: any,
    @Body() body: { answers: { questionId: number; selectedAnswer: number }[] },
  ) {
    return this.quizzesService.submitAttempt(
      +attemptId,
      req.user.id,
      body.answers,
    );
  }

  @Get("attempts/:attemptId")
  @UseGuards(JwtAuthGuard)
  async getAttemptResult(
    @Param("attemptId") attemptId: number,
    @Request() req: any,
  ) {
    return this.quizzesService.getAttemptResult(+attemptId, req.user.id);
  }

  @Get("my-attempts")
  @UseGuards(JwtAuthGuard)
  async getMyAttempts(@Request() req: any, @Query("quizId") quizId?: number) {
    return this.quizzesService.getUserAttempts(
      req.user.id,
      quizId ? +quizId : undefined,
    );
  }
}
