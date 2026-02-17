// src/progress/progress.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/users.entity";
import { Course } from "../courses/courses.entity";

export enum ProgressStatus {
  NOT_STARTED = "Not Started",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed",
}

@Entity("progress")
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Course, (course) => course.progress, { onDelete: "CASCADE" })
  course: Course;

  @Column()
  courseId: number;

  @Column({
    type: "enum",
    enum: ProgressStatus,
    default: ProgressStatus.NOT_STARTED,
  })
  status: ProgressStatus;

  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  completionPercentage: number;

  @Column({ nullable: true, type: "timestamp" })
  lastAccessedAt: Date;

  @Column({ nullable: true, type: "timestamp" })
  completedAt: Date | null;

  @CreateDateColumn()
  enrolledAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
