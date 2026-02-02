// src/quizzes/quizzes.service.ts
import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuizAttempt } from './quiz-attempt.entity';
import { Question } from '../question/question.entity';
import { Progress } from '../progress/progress.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(QuizAttempt)
    private quizAttemptRepository: Repository<QuizAttempt>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  // Quiz methods
  async createQuiz(
    courseId: number,
    title: string,
    description?: string,
    timeLimit = 10,
    passingScore = 60,
  ): Promise<Quiz> {
    const quiz = this.quizRepository.create({
      courseId,
      title,
      description,
      timeLimit,
      passingScore,
    });
    return this.quizRepository.save(quiz);
  }

  async findAllQuizzes(): Promise<Quiz[]> {
    return this.quizRepository.find({
      where: { isPublished: true },
      relations: ['course'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllQuizzesForInstructor(instructorId: number): Promise<Quiz[]> {
    return this.quizRepository.find({
      relations: ['course', 'questions'],
      where: {
        course: {
          instructorId,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllQuizzesAdmin(): Promise<Quiz[]> {
    return this.quizRepository.find({
      relations: ['course', 'questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findQuizzesByCourse(courseId: number): Promise<Quiz[]> {
    return this.quizRepository.find({
      where: { courseId, isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findQuizById(id: number): Promise<Quiz | null> {
    return this.quizRepository.findOne({
      where: { id },
      relations: ['questions', 'course'],
    });
  }

  async updateQuiz(id: number, data: Partial<Quiz>): Promise<Quiz | null> {
    // Check if we're publishing the quiz
    const isPublishing = data.isPublished === true;

    // Get the current quiz state before update
    const existingQuiz = await this.quizRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!existingQuiz) {
      throw new NotFoundException('Quiz not found');
    }

    const wasUnpublished = !existingQuiz.isPublished;

    await this.quizRepository.update(id, data);

    // If quiz is being published for the first time, notify enrolled students
    if (isPublishing && wasUnpublished && existingQuiz.courseId) {
      await this.notifyEnrolledStudentsAboutQuiz(existingQuiz);
    }

    return this.quizRepository.findOneBy({ id });
  }

  private async notifyEnrolledStudentsAboutQuiz(quiz: Quiz): Promise<void> {
    // Get all enrolled students for this course
    const enrolledStudents = await this.progressRepository.find({
      where: { courseId: quiz.courseId },
      select: ['userId'],
    });

    if (enrolledStudents.length === 0) return;

    const userIds = enrolledStudents.map(p => p.userId);
    const courseName = quiz.course?.title || 'your course';

    await this.notificationsService.notifyEnrolledStudents(
      userIds,
      `New Quiz Available: ${quiz.title}`,
      `A new quiz "${quiz.title}" has been published in ${courseName}. Take the quiz now to test your knowledge!`,
      NotificationType.SYSTEM,
      `/quizzes/${quiz.id}`,
    );
  }

  async deleteQuiz(id: number): Promise<void> {
    await this.quizRepository.delete(id);
  }

  // Question methods
  async addQuestion(
    quizId: number,
    content: string,
    options: string[],
    correctAnswer: number,
    explanation?: string,
    points = 1,
  ): Promise<Question> {
    const quiz = await this.quizRepository.findOneBy({ id: quizId });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const question = this.questionRepository.create({
      quizId,
      content,
      options,
      correctAnswer,
      explanation,
      points,
    });
    return this.questionRepository.save(question);
  }

  async updateQuestion(id: number, data: Partial<Question>): Promise<Question | null> {
    await this.questionRepository.update(id, data);
    return this.questionRepository.findOneBy({ id });
  }

  async deleteQuestion(id: number): Promise<void> {
    await this.questionRepository.delete(id);
  }

  // Quiz attempt methods
  async startAttempt(userId: number, quizId: number): Promise<QuizAttempt> {
    const quiz = await this.quizRepository.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    if (!quiz) throw new NotFoundException('Quiz not found');

    if (quiz.maxAttempts > 0) {
      const attemptCount = await this.quizAttemptRepository.count({
        where: { userId, quizId },
      });

      if (attemptCount >= quiz.maxAttempts) {
        throw new BadRequestException('Maximum attempts reached');
      }
    }

    const attempt = this.quizAttemptRepository.create({
      userId,
      quizId,
      answers: [],
      score: 0,
      totalQuestions: quiz.questions.length,
      correctAnswers: 0,
      passed: false,
      startedAt: new Date(),
    });

    return this.quizAttemptRepository.save(attempt);
  }

  async submitAttempt(
    attemptId: number,
    userId: number,
    answers: { questionId: number; selectedAnswer: number }[],
  ): Promise<QuizAttempt> {
    const attempt = await this.quizAttemptRepository.findOne({
      where: { id: attemptId, userId },
      relations: ['quiz', 'quiz.questions'],
    });

    if (!attempt) throw new NotFoundException('Attempt not found');

    const quiz = attempt.quiz;
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers.find((a) => a.questionId === question.id);
      if (userAnswer && userAnswer.selectedAnswer === question.correctAnswer) {
        correctCount++;
        earnedPoints += question.points;
      }
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passingScore;
    const timeTaken = Math.floor((new Date().getTime() - attempt.startedAt.getTime()) / 1000);

    attempt.answers = answers;
    attempt.score = score;
    attempt.correctAnswers = correctCount;
    attempt.passed = passed;
    attempt.timeTaken = timeTaken;

    return this.quizAttemptRepository.save(attempt);
  }

  async getAttemptResult(attemptId: number, userId: number): Promise<QuizAttempt | null> {
    return this.quizAttemptRepository.findOne({
      where: { id: attemptId, userId },
      relations: ['quiz', 'quiz.questions'],
    });
  }

  async getUserAttempts(userId: number, quizId?: number): Promise<QuizAttempt[]> {
    const where: any = { userId };
    if (quizId) where.quizId = quizId;

    return this.quizAttemptRepository.find({
      where,
      relations: ['quiz'],
      order: { completedAt: 'DESC' },
    });
  }

  async getQuizStats(quizId: number): Promise<{
    totalAttempts: number;
    passRate: number;
    averageScore: number;
  }> {
    const attempts = await this.quizAttemptRepository.find({
      where: { quizId },
    });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const totalScore = attempts.reduce((sum, a) => sum + Number(a.score), 0);

    return {
      totalAttempts,
      passRate: totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0,
      averageScore: totalAttempts > 0 ? totalScore / totalAttempts : 0,
    };
  }
}
