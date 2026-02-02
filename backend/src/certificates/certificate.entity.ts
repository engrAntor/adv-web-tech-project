// src/certificates/certificate.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Course } from '../courses/courses.entity';

@Entity('certificates')
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  certificateCode: string;

  @ManyToOne(() => User, (user) => user.certificates, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Course, (course) => course.certificates, { onDelete: 'CASCADE' })
  course: Course;

  @Column()
  courseId: number;

  @Column({ nullable: true })
  studentName: string;

  @CreateDateColumn()
  issuedAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
