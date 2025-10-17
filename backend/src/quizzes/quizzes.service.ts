// src/quizzes/quizzes.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';  // Ensure correct import path
import { Repository } from 'typeorm';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
  ) {}

  async createQuiz(title: string): Promise<Quiz> {
    const quiz = this.quizRepository.create({ title });
    return this.quizRepository.save(quiz);
  }
}
