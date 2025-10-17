// src/question/question.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './question.entity';
import { QuestionService } from './question.service';
//import { QuestionController } from './question.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Question])], // ✅ this line is required
  providers: [QuestionService],
  //controllers: [QuestionController],
  exports: [QuestionService], // Optional if used outside
})
export class QuestionModule {}
