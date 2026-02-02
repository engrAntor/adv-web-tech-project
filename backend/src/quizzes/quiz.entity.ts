// src/quizzes/quiz.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Question } from '../question/question.entity';
import { Course } from '../courses/courses.entity';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  courseId: number;

  @Column({ default: 10 })
  timeLimit: number; // Time limit in minutes

  @Column({ default: 60 })
  passingScore: number; // Passing percentage

  @Column({ default: true })
  allowRetake: boolean;

  @Column({ default: 0 })
  maxAttempts: number; // 0 = unlimited

  @Column({ default: true })
  showCorrectAnswers: boolean;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.quiz)
  questions: Question[];
}
