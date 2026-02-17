// src/users/user.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Progress } from "../progress/progress.entity";
import { Certificate } from "../certificates/certificate.entity";

export enum UserRole {
  USER = "user",
  INSTRUCTOR = "instructor",
  ADVISOR = "advisor",
  ADMIN = "admin",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ type: "varchar", nullable: true })
  emailVerificationToken: string;

  @Column({ type: "varchar", nullable: true })
  emailVerificationOTP: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerificationExpires: Date;

  @Column({ type: "varchar", nullable: true })
  passwordResetToken: string;

  @Column({ type: "varchar", nullable: true })
  passwordResetOTP: string;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Progress, (progress) => progress.user)
  progress: Progress[];

  @OneToMany(() => Certificate, (certificate) => certificate.user)
  certificates: Certificate[];
}
