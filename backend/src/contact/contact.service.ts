// src/contact/contact.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Contact, ContactStatus } from "./contact.entity";
import { EmailService } from "../email/email.service";

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
    private emailService: EmailService,
  ) {}

  async create(
    name: string,
    email: string,
    subject: string,
    message: string,
    userId?: number,
  ): Promise<Contact> {
    const contact = this.contactRepository.create({
      name,
      email,
      subject,
      message,
      userId,
    });
    const savedContact = await this.contactRepository.save(contact);

    // Send email notification to admin
    await this.emailService.sendContactNotification(
      name,
      email,
      subject,
      message,
    );

    // Send auto-receipt email to user
    await this.emailService.sendContactReceipt(name, email, subject);

    return savedContact;
  }

  async findAll(
    status?: ContactStatus,
    limit = 20,
    offset = 0,
  ): Promise<{ contacts: Contact[]; total: number }> {
    const where: any = {};
    if (status) where.status = status;

    const [contacts, total] = await this.contactRepository.findAndCount({
      where,
      relations: ["user"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return { contacts, total };
  }

  async findOne(id: number): Promise<Contact | null> {
    return this.contactRepository.findOne({
      where: { id },
      relations: ["user"],
    });
  }

  async updateStatus(
    id: number,
    status: ContactStatus,
    adminResponse?: string,
  ): Promise<Contact | null> {
    await this.contactRepository.update(id, { status, adminResponse });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.contactRepository.delete(id);
  }
}
