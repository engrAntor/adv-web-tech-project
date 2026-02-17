// src/question/question.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Quiz } from "../quizzes/quiz.entity";

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "simple-json" })
  options: string[]; // Array of answer options

  @Column()
  correctAnswer: number; // Index of correct answer (0-based)

  @Column({ type: "text", nullable: true })
  explanation: string;

  @Column({ default: 1 })
  points: number;

  @Column({ default: 0 })
  sortOrder: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: "CASCADE" })
  quiz: Quiz;

  @Column()
  quizId: number;

  @CreateDateColumn()
  createdAt: Date;
}
