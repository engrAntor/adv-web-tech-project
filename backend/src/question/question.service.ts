// src/question/question.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Question } from "./question.entity"; // Correct path

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionRepository.find();
  }

  async create(content: string, quizId: number): Promise<Question> {
    const question = this.questionRepository.create({
      content,
      quiz: { id: quizId },
    });
    return this.questionRepository.save(question);
  }
}
