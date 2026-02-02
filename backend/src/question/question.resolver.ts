// src/question/question.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QuestionService } from './question.service';
import { Question } from './question.entity';  // Correct path

@Resolver(() => Question)
export class QuestionResolver {
  constructor(private readonly questionService: QuestionService) {}

  @Query(() => [Question])
  async getQuestions(): Promise<Question[]> {
    return this.questionService.findAll();
  }

  @Mutation(() => Question)
  async createQuestion(
    @Args('content') content: string,
    @Args('quizId') quizId: number,
  ): Promise<Question> {
    return this.questionService.create(content, quizId);
  }
}
