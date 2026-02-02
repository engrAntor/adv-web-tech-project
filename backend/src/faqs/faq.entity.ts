// src/faqs/faq.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FAQCategory {
  ENROLLMENT = 'Enrollment',
  TECHNICAL = 'Technical',
  PAYMENTS = 'Payments',
  CERTIFICATES = 'Certificates',
  GENERAL = 'General',
}

@Entity('faqs')
export class FAQ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({
    type: 'enum',
    enum: FAQCategory,
    default: FAQCategory.GENERAL,
  })
  category: FAQCategory;

  @Column({ default: 0 })
  sortOrder: number;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
