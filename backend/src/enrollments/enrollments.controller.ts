// src/enrollments/enrollments.controller.ts
import { Controller, Get, Post, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/users.entity';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: { courseId: number; couponCode?: string },
  ) {
    return this.enrollmentsService.create(req.user.id, body.courseId, 0, undefined, undefined, body.couponCode);
  }

  @Get('my-enrollments')
  async findMyEnrollments(@Request() req: any) {
    return this.enrollmentsService.findByUser(req.user.id);
  }

  @Get('check/:courseId')
  async isEnrolled(@Request() req: any, @Param('courseId') courseId: number) {
    const enrolled = await this.enrollmentsService.isEnrolled(req.user.id, +courseId);
    return { enrolled };
  }

  @Get('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async findByCourse(
    @Param('courseId') courseId: number,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.enrollmentsService.findByCourse(+courseId, +limit, +offset);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.enrollmentsService.findOne(+id);
  }
}
