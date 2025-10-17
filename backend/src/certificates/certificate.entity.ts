// src/certificates/certificate.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/users.entity';  // Correct path
import { Course } from '../courses/courses.entity';  // Correct path

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  certificateCode: string;  // Modify the field name here

  @ManyToOne(() => User, (user) => user.certificates)
  user: User;

  @ManyToOne(() => Course, (course) => course.certificates)
  course: Course;
}
