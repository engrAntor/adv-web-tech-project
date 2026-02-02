// src/quizzes/quiz-attempt.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Quiz } from './quiz.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Quiz, { onDelete: 'CASCADE' })
  quiz: Quiz;

  @Column()
  quizId: number;

  @Column({ type: 'simple-json' })
  answers: { questionId: number; selectedAnswer: number }[];

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column()
  totalQuestions: number;

  @Column()
  correctAnswers: number;

  @Column()
  passed: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  startedAt: Date;

  @CreateDateColumn()
  completedAt: Date;

  @Column({ nullable: true })
  timeTaken: number; // Time taken in seconds
}
