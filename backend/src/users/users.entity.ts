// src/users/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Progress } from '../progress/progress.entity';
import { Certificate } from '../certificates/certificate.entity';  // Correct path
@Entity('users')  // Table 'users'
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  
  @OneToMany(() => Progress, (progress) => progress.user)
  progress: Progress[];
    certificates: Certificate[];
}
