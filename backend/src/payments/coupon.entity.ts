// src/payments/coupon.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "../courses/courses.entity";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

@Entity("coupons")
export class Coupon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  discountType: DiscountType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  discountValue: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  minPurchaseAmount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  maxDiscountAmount: number;

  @ManyToOne(() => Course, { nullable: true, onDelete: "CASCADE" })
  course: Course;

  @Column({ nullable: true })
  courseId: number;

  @Column({ nullable: true })
  validFrom: Date;

  @Column({ nullable: true })
  validUntil: Date;

  @Column({ default: -1 })
  usageLimit: number; // -1 means unlimited

  @Column({ default: 0 })
  usedCount: number;

  @Column({ default: 1 })
  usageLimitPerUser: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
