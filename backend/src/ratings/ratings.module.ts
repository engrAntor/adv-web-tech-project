// src/ratings/ratings.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rating } from "./rating.entity";
import { RatingsService } from "./ratings.service";
import { RatingsController } from "./ratings.controller";
import { Course } from "../courses/courses.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Course])],
  providers: [RatingsService],
  controllers: [RatingsController],
  exports: [RatingsService],
})
export class RatingsModule {}
