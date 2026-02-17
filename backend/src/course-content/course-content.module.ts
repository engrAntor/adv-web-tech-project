// src/course-content/course-content.module.ts

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CourseContent } from "./course-content.entity";
import { Course } from "../courses/courses.entity";
import { CourseContentService } from "./course-content.service";
import { CourseContentController } from "./course-content.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CourseContent, Course])],
  providers: [CourseContentService],
  controllers: [CourseContentController],
  exports: [CourseContentService],
})
export class CourseContentModule {}
