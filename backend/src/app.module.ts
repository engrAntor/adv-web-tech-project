// src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Auth & Users
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/users.entity';

// Courses & Progress
import { CoursesModule } from './courses/courses.module';
import { Course } from './courses/courses.entity';
import { Progress } from './progress/progress.entity';

// Course Content
import { CourseContentModule } from './course-content/course-content.module';
import { CourseContent } from './course-content/course-content.entity';

// Certificates
import { CertificatesModule } from './certificates/certificates.module';
import { Certificate } from './certificates/certificate.entity';

// Quizzes & Questions
import { QuizzesModule } from './quizzes/quizzes.module';
import { QuestionModule } from './question/question.module';
import { Quiz } from './quizzes/quiz.entity';
import { QuizAttempt } from './quizzes/quiz-attempt.entity';
import { Question } from './question/question.entity';

// Forums
import { ForumsModule } from './forums/forums.module';
import { Forum } from './forums/forum.entity';
import { Post } from './posts/post.entity';
import { Comment } from './comments/comment.entity';

// Ratings
import { RatingsModule } from './ratings/ratings.module';
import { Rating } from './ratings/rating.entity';

// Notifications
import { NotificationsModule } from './notifications/notifications.module';
import { Notification } from './notifications/notification.entity';

// Activity Logs
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { ActivityLog } from './activity-logs/activity-log.entity';

// FAQs
import { FaqsModule } from './faqs/faqs.module';
import { FAQ } from './faqs/faq.entity';

// Contact
import { ContactModule } from './contact/contact.module';
import { Contact } from './contact/contact.entity';

// Enrollments
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { Enrollment } from './enrollments/enrollment.entity';

// Payments
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/payment.entity';
import { Coupon } from './payments/coupon.entity';
import { Invoice } from './payments/invoice.entity';

// Email
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'out'),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Use DATABASE_URL if available, otherwise use individual env vars
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'online_learning',
          }),
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      entities: [
        // Core entities
        User,
        Course,
        Progress,
        Certificate,
        CourseContent,
        // Quiz entities
        Quiz,
        QuizAttempt,
        Question,
        // Forum entities
        Forum,
        Post,
        Comment,
        // Other entities
        Rating,
        Notification,
        ActivityLog,
        FAQ,
        Contact,
        Enrollment,
        // Payment entities
        Payment,
        Coupon,
        Invoice,
      ],
      synchronize: true, // Auto-sync schema (set to false in production)
    }),
    // Email (must be before Auth)
    EmailModule,
    // Auth & Users
    AuthModule,
    UsersModule,
    // Learning
    CoursesModule,
    CourseContentModule,
    CertificatesModule,
    QuizzesModule,
    QuestionModule,
    // Community
    ForumsModule,
    RatingsModule,
    // Support
    NotificationsModule,
    ActivityLogsModule,
    FaqsModule,
    ContactModule,
    EnrollmentsModule,
    // Payments
    PaymentsModule,
  ],
})
export class AppModule {}
