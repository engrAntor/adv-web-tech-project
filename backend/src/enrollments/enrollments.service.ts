// src/enrollments/enrollments.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment, PaymentStatus } from './enrollment.entity';
import { Course } from '../courses/courses.entity';
import { Progress, ProgressStatus } from '../progress/progress.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async create(
    userId: number,
    courseId: number,
    pricePaid = 0,
    paymentStatus = PaymentStatus.COMPLETED,
    stripePaymentId?: string,
    couponCode?: string,
  ): Promise<Enrollment> {
    const existing = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      throw new BadRequestException('Already enrolled in this course');
    }

    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      pricePaid,
      paymentStatus,
      stripePaymentId,
      couponCode,
    });

    await this.enrollmentRepository.save(enrollment);

    // Create progress record
    const progress = this.progressRepository.create({
      userId,
      courseId,
      status: ProgressStatus.NOT_STARTED,
      completionPercentage: 0,
    });
    await this.progressRepository.save(progress);

    // Update course enrollment count
    await this.courseRepository.increment({ id: courseId }, 'enrollmentCount', 1);

    return enrollment;
  }

  async findByUser(userId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      relations: ['course'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async findByCourse(courseId: number, limit = 20, offset = 0): Promise<{ enrollments: Enrollment[]; total: number }> {
    const [enrollments, total] = await this.enrollmentRepository.findAndCount({
      where: { courseId },
      relations: ['user'],
      order: { enrolledAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { enrollments, total };
  }

  async isEnrolled(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId, paymentStatus: PaymentStatus.COMPLETED },
    });
    return !!enrollment;
  }

  async findOne(id: number): Promise<Enrollment | null> {
    return this.enrollmentRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
  }
}
