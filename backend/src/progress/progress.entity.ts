// src/progress/progress.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';
import { Course } from '../courses/courses.entity';

@Entity('progress')  // Table 'progress'
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.progress)
  user: User;

  @ManyToOne(() => Course, (course) => course.progress)
  course: Course;

  @Column()
  status: string;  // Not Started, In Progress, Completed
}
