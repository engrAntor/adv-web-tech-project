// src/course-content/course-content.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseContent, ContentType } from './course-content.entity';
import { Course } from '../courses/courses.entity';

@Injectable()
export class CourseContentService {
  constructor(
    @InjectRepository(CourseContent)
    private contentRepository: Repository<CourseContent>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(
    courseId: number,
    instructorId: number,
    data: {
      title: string;
      description?: string;
      contentType?: ContentType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      externalUrl?: string;
      duration?: number;
      sortOrder?: number;
    },
  ): Promise<CourseContent> {
    // Verify the instructor owns this course
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only add content to your own courses');
    }

    // Get the next sort order if not provided
    if (data.sortOrder === undefined) {
      const lastContent = await this.contentRepository.findOne({
        where: { courseId },
        order: { sortOrder: 'DESC' },
      });
      data.sortOrder = lastContent ? lastContent.sortOrder + 1 : 0;
    }

    const content = this.contentRepository.create({
      courseId,
      ...data,
    });

    return this.contentRepository.save(content);
  }

  async findByCourse(courseId: number, includeUnpublished = false): Promise<CourseContent[]> {
    const where: any = { courseId };
    if (!includeUnpublished) {
      where.isPublished = true;
    }

    return this.contentRepository.find({
      where,
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: number): Promise<CourseContent | null> {
    return this.contentRepository.findOne({
      where: { id },
      relations: ['course'],
    });
  }

  async update(
    id: number,
    instructorId: number,
    data: Partial<CourseContent>,
  ): Promise<CourseContent | null> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only update content in your own courses');
    }

    await this.contentRepository.update(id, data);
    return this.contentRepository.findOneBy({ id });
  }

  async delete(id: number, instructorId: number): Promise<void> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only delete content from your own courses');
    }

    await this.contentRepository.delete(id);
  }

  async reorder(courseId: number, instructorId: number, contentIds: number[]): Promise<void> {
    // Verify the instructor owns this course
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only reorder content in your own courses');
    }

    // Update sort order for each content item
    for (let i = 0; i < contentIds.length; i++) {
      await this.contentRepository.update(
        { id: contentIds[i], courseId },
        { sortOrder: i },
      );
    }
  }

  async togglePublish(id: number, instructorId: number): Promise<CourseContent | null> {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    if (content.course.instructorId !== instructorId) {
      throw new ForbiddenException('You can only modify content in your own courses');
    }

    await this.contentRepository.update(id, { isPublished: !content.isPublished });
    return this.contentRepository.findOneBy({ id });
  }
}
