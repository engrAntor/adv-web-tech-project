// src/payments/invoice.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "../users/users.entity";
import { Payment } from "./payment.entity";

@Entity("invoices")
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  invoiceNumber: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Payment, { onDelete: "CASCADE" })
  payment: Payment;

  @Column()
  paymentId: number;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column({ nullable: true })
  customerAddress: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column()
  courseName: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ nullable: true })
  couponCode: string;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;

  @Column()
  currency: string;

  @Column()
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true, type: "text" })
  notes: string;

  @CreateDateColumn()
  issuedAt: Date;
}
