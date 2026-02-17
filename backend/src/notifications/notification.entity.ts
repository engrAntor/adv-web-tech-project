// src/notifications/notification.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "../users/users.entity";

export enum NotificationType {
  COURSE_ENROLLED = "course_enrolled",
  COURSE_COMPLETED = "course_completed",
  CERTIFICATE_ISSUED = "certificate_issued",
  QUIZ_COMPLETED = "quiz_completed",
  FORUM_REPLY = "forum_reply",
  PAYMENT_SUCCESS = "payment_success",
  SYSTEM = "system",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  link: string;

  @CreateDateColumn()
  createdAt: Date;
}
