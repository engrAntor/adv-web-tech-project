// src/support/support.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Ticket } from "../tickets/ticket.entity";
import { Message } from "./message.entity";
import { Repository } from "typeorm";

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async createTicket(subject: string): Promise<Ticket> {
    const ticket = this.ticketRepository.create({ subject });
    return this.ticketRepository.save(ticket);
  }

  async addMessage(ticketId: number, content: string): Promise<Message> {
    const ticket = await this.ticketRepository.findOneBy({ id: ticketId }); // ✅ FIXED
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const message = this.messageRepository.create({ content, ticket });
    return this.messageRepository.save(message);
  }
}
