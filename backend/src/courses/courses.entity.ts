// src/courses/course.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Progress } from '../progress/progress.entity';
import { Certificate } from '../certificates/certificate.entity';

@Entity('courses')  // Table 'courses'
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(() => Progress, (progress) => progress.course)
  progress: Progress[];
    certificates: Certificate[];
}
