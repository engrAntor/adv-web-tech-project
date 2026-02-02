// src/activity-logs/activity-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';

export enum ActivityAction {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_RESET = 'password_reset',
  PROFILE_UPDATE = 'profile_update',
  COURSE_ENROLL = 'course_enroll',
  COURSE_COMPLETE = 'course_complete',
  QUIZ_ATTEMPT = 'quiz_attempt',
  FORUM_POST = 'forum_post',
  PAYMENT = 'payment',
  ADMIN_ACTION = 'admin_action',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  user: User;

  @Column({ nullable: true })
  userId: number | null;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: number;

  @CreateDateColumn()
  createdAt: Date;
}
