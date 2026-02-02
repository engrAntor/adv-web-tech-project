// src/course-content/course-content.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from '../courses/courses.entity';

export enum ContentType {
  PDF = 'pdf',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LINK = 'link',
}

@Entity('course_content')
export class CourseContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ContentType,
    default: ContentType.PDF,
  })
  contentType: ContentType;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ nullable: true })
  fileSize: number; // Size in bytes

  @Column({ nullable: true })
  externalUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: 0 })
  duration: number; // Duration in minutes for videos

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  courseId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
