// src/courses/courses.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Course, CourseCategory, CourseDifficulty } from './courses.entity';
import { Progress, ProgressStatus } from '../progress/progress.entity';
import { User } from '../users/users.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(
    filters: {
      category?: CourseCategory;
      difficulty?: CourseDifficulty;
      search?: string;
      minRating?: number;
      isFree?: boolean;
      instructorId?: number;
    },
    limit = 20,
    offset = 0,
  ): Promise<{ courses: Course[]; total: number }> {
    const query = this.courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .where('course.isPublished = :isPublished', { isPublished: true });

    if (filters.category) {
      query.andWhere('LOWER(course.category::text) = LOWER(:category)', { category: filters.category });
    }

    if (filters.difficulty) {
      query.andWhere('LOWER(course.difficulty::text) = LOWER(:difficulty)', { difficulty: filters.difficulty });
    }

    if (filters.search) {
      query.andWhere(
        '(LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.minRating) {
      query.andWhere('course.averageRating >= :minRating', { minRating: filters.minRating });
    }

    if (filters.isFree !== undefined) {
      query.andWhere('course.isFree = :isFree', { isFree: filters.isFree });
    }

    if (filters.instructorId) {
      query.andWhere('course.instructorId = :instructorId', { instructorId: filters.instructorId });
    }

    const [courses, total] = await query
      .orderBy('course.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { courses, total };
  }

  async findById(id: number): Promise<Course | null> {
    return this.courseRepository.findOne({
      where: { id },
      relations: ['instructor'],
    });
  }

  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return user;
  }

  async getCourses(): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isPublished: true },
      relations: ['instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async createCourse(data: {
    title: string;
    description: string;
    syllabus?: string;
    thumbnail?: string;
    category?: CourseCategory;
    difficulty?: CourseDifficulty;
    duration?: number;
    price?: number;
    instructorId?: number;
  }): Promise<Course> {
    const course = this.courseRepository.create({
      ...data,
      isFree: !data.price || data.price === 0,
    });
    return this.courseRepository.save(course);
  }

  async updateCourse(id: number, data: Partial<Course>): Promise<Course | null> {
    const course = await this.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (data.price !== undefined) {
      data.isFree = data.price === 0;
    }

    await this.courseRepository.update(id, data);
    return this.courseRepository.findOneBy({ id });
  }

  async deleteCourse(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }

  // Progress methods
  async getProgress(user: User): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { userId: user.id },
      relations: ['course'],
    });
  }

  async getUserProgress(userId: number, courseId: number): Promise<Progress | null> {
    return this.progressRepository.findOne({
      where: { userId, courseId },
      relations: ['course'],
    });
  }

  async enrollUser(userId: number, courseId: number): Promise<Progress> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const existing = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return existing;
    }

    const progress = this.progressRepository.create({
      userId,
      courseId,
      status: ProgressStatus.NOT_STARTED,
      completionPercentage: 0,
    });

    // Update course enrollment count
    await this.courseRepository.increment({ id: courseId }, 'enrollmentCount', 1);

    return this.progressRepository.save(progress);
  }

  async updateProgress(
    userId: number,
    courseId: number,
    completionPercentage: number,
  ): Promise<Progress | null> {
    const progress = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (!progress) {
      throw new NotFoundException('Enrollment not found');
    }

    let status = ProgressStatus.IN_PROGRESS;
    let completedAt: Date | null = null;

    if (completionPercentage === 0) {
      status = ProgressStatus.NOT_STARTED;
    } else if (completionPercentage >= 100) {
      status = ProgressStatus.COMPLETED;
      completedAt = new Date();
    }

    await this.progressRepository.update(progress.id, {
      completionPercentage: Math.min(100, completionPercentage),
      status,
      completedAt,
      lastAccessedAt: new Date(),
    });

    return this.progressRepository.findOne({
      where: { id: progress.id },
      relations: ['course'],
    });
  }

  async getCategories(): Promise<string[]> {
    return Object.values(CourseCategory);
  }

  async getDifficulties(): Promise<string[]> {
    return Object.values(CourseDifficulty);
  }

  async getPopularCourses(limit = 10): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isPublished: true },
      order: { enrollmentCount: 'DESC' },
      take: limit,
      relations: ['instructor'],
    });
  }

  async getTopRatedCourses(limit = 10): Promise<Course[]> {
    return this.courseRepository.find({
      where: { isPublished: true },
      order: { averageRating: 'DESC' },
      take: limit,
      relations: ['instructor'],
    });
  }
}
