// src/courses/course.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Progress } from '../progress/progress.entity';
import { Certificate } from '../certificates/certificate.entity';
import { User } from '../users/users.entity';

export enum CourseCategory {
  WEB_DEVELOPMENT = 'Web Development',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  DATA_SCIENCE = 'Data Science',
  MACHINE_LEARNING = 'Machine Learning',
  CLOUD_COMPUTING = 'Cloud Computing',
  DEVOPS = 'DevOps',
  CYBERSECURITY = 'Cybersecurity',
  DATABASE = 'Database',
  PROGRAMMING = 'Programming',
  DESIGN = 'Design',
  BUSINESS = 'Business',
  SOFTWARE_ENGINEERING = 'Software Engineering',
  INFORMATION_SYSTEMS = 'Information Systems',
  COMPUTER_ENGINEERING = 'Computer Engineering',
  NETWORKING = 'Networking',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  ELECTRONICS = 'Electronics',
  OTHER = 'Other',
}

export enum CourseDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true, type: 'text' })
  syllabus: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  previewVideo: string;

  @Column({
    type: 'enum',
    enum: CourseCategory,
    default: CourseCategory.OTHER,
  })
  category: CourseCategory;

  @Column({
    type: 'enum',
    enum: CourseDifficulty,
    default: CourseDifficulty.BEGINNER,
  })
  difficulty: CourseDifficulty;

  @Column({ default: 0 })
  duration: number; // Duration in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: false })
  isFree: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column({ default: 0 })
  totalRatings: number;

  @Column({ default: 0 })
  enrollmentCount: number;

  @ManyToOne(() => User, { nullable: true })
  instructor: User;

  @Column({ nullable: true })
  instructorId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Progress, (progress) => progress.course)
  progress: Progress[];

  @OneToMany(() => Certificate, (certificate) => certificate.course)
  certificates: Certificate[];
}
