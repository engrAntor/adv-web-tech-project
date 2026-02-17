// src/ratings/ratings.service.ts
import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rating } from "./rating.entity";
import { Course } from "../courses/courses.entity";

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(
    userId: number,
    courseId: number,
    rating: number,
    review?: string,
  ): Promise<Rating> {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5");
    }

    const existing = await this.ratingRepository.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      existing.rating = rating;
      existing.review = review || existing.review;
      await this.ratingRepository.save(existing);
      await this.updateCourseRating(courseId);
      return existing;
    }

    const newRating = this.ratingRepository.create({
      userId,
      courseId,
      rating,
      review,
      isApproved: true,
    });

    await this.ratingRepository.save(newRating);
    await this.updateCourseRating(courseId);
    return newRating;
  }

  private async updateCourseRating(courseId: number): Promise<void> {
    const result = await this.ratingRepository
      .createQueryBuilder("rating")
      .select("AVG(rating.rating)", "avg")
      .addSelect("COUNT(*)", "count")
      .where("rating.courseId = :courseId", { courseId })
      .andWhere("rating.isApproved = true")
      .getRawOne();

    await this.courseRepository.update(courseId, {
      averageRating: parseFloat(result.avg) || 0,
      totalRatings: parseInt(result.count) || 0,
    });
  }

  async findByCourse(
    courseId: number,
    limit = 10,
    offset = 0,
  ): Promise<{ ratings: Rating[]; total: number }> {
    const [ratings, total] = await this.ratingRepository.findAndCount({
      where: { courseId, isApproved: true },
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return { ratings, total };
  }

  async findByUser(userId: number): Promise<Rating[]> {
    return this.ratingRepository.find({
      where: { userId },
      relations: ["course"],
      order: { createdAt: "DESC" },
    });
  }

  async getUserCourseRating(
    userId: number,
    courseId: number,
  ): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { userId, courseId },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id, userId },
    });

    if (rating) {
      const courseId = rating.courseId;
      await this.ratingRepository.delete(id);
      await this.updateCourseRating(courseId);
    }
  }

  async moderate(id: number, isApproved: boolean): Promise<Rating | null> {
    await this.ratingRepository.update(id, { isApproved });
    const rating = await this.ratingRepository.findOneBy({ id });
    if (rating) {
      await this.updateCourseRating(rating.courseId);
    }
    return rating;
  }
}
