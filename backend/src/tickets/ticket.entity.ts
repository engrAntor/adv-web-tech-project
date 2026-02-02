// src/tickets/ticket.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Message } from '../support/message.entity';  // Correct path

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subject: string;

  @OneToMany(() => Message, (message) => message.ticket)
  messages: Message[];
}
