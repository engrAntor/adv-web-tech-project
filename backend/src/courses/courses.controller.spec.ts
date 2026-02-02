// src/courses/courses.controller.ts

import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { Course } from './courses.entity';  // Import Course Entity
import { User } from '../users/users.entity';  // Import User Entity
import { Progress } from '../progress/progress.entity';  // Import Progress Entity

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async getCourses(): Promise<Course[]> {
    return this.coursesService.getCourses();
  }

  @Get(':userId/progress')
  async getProgress(@Param('userId') userId: number): Promise<Progress[]> {
    const user = await this.coursesService.findUserById(userId);  // This will now work
    return this.coursesService.getProgress(user);
  }

  @Post(':userId/enroll/:courseId')
  async enrollUser(
    @Param('userId') userId: number,
    @Param('courseId') courseId: number,
  ): Promise<Progress> {
    const user = await this.coursesService.findUserById(userId);  // This will now work
    return this.coursesService.enrollUser(user, courseId);
  }

  @Post('create')
  async createCourse(@Body() createCourseDto: { title: string, description: string }): Promise<Course> {
    return this.coursesService.createCourse(createCourseDto.title, createCourseDto.description);
  }
}
