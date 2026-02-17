// src/quizzes/quizzes.module.ts
import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Quiz } from "./quiz.entity";
import { QuizAttempt } from "./quiz-attempt.entity";
import { Question } from "../question/question.entity";
import { Progress } from "../progress/progress.entity";
import { QuizzesService } from "./quizzes.service";
import { QuizzesController } from "./quizzes.controller";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, QuizAttempt, Question, Progress]),
    forwardRef(() => NotificationsModule),
  ],
  providers: [QuizzesService],
  controllers: [QuizzesController],
  exports: [QuizzesService],
})
export class QuizzesModule {}
