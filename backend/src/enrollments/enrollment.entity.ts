// src/enrollments/enrollment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../users/users.entity';
import { Course } from '../courses/courses.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('enrollments')
@Unique(['userId', 'courseId'])
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  courseId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  pricePaid: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({ nullable: true })
  couponCode: string;

  @CreateDateColumn()
  enrolledAt: Date;
}
