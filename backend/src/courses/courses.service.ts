// src/courses/courses.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './courses.entity';  // Import Course Entity
import { Progress } from '../progress/progress.entity';  // Import Progress Entity
import { User } from '../users/users.entity';  // Import User Entity

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,

    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,

    @InjectRepository(User)
    private userRepository: Repository<User>,  // Inject User Repository
  ) {}

  async getCourses(): Promise<Course[]> {
    return this.courseRepository.find();
  }

  async getProgress(user: User): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { user },
      relations: ['course'],
    });
  }

  // Updated method using findOneBy and null check
  async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: userId });  // find user by ID
    if (!user) {
      throw new Error(`User with id ${userId} not found`);  // If user is not found, throw an error
    }
    return user;
  }

  async enrollUser(user: User, courseId: number): Promise<Progress> {
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new Error('Course not found');
    }

    const progress = this.progressRepository.create({
      user,
      course,
      status: 'Not Started',
    });

    return this.progressRepository.save(progress);
  }

  async createCourse(title: string, description: string): Promise<Course> {
    const course = this.courseRepository.create({ title, description });
    return this.courseRepository.save(course);
  }
}
