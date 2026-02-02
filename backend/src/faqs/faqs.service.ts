// src/faqs/faqs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { FAQ, FAQCategory } from './faq.entity';

@Injectable()
export class FaqsService {
  constructor(
    @InjectRepository(FAQ)
    private faqRepository: Repository<FAQ>,
  ) {}

  async create(question: string, answer: string, category: FAQCategory, sortOrder = 0): Promise<FAQ> {
    const faq = this.faqRepository.create({
      question,
      answer,
      category,
      sortOrder,
    });
    return this.faqRepository.save(faq);
  }

  async findAll(publishedOnly = true): Promise<FAQ[]> {
    const where: any = {};
    if (publishedOnly) where.isPublished = true;

    return this.faqRepository.find({
      where,
      order: { category: 'ASC', sortOrder: 'ASC' },
    });
  }

  async findByCategory(category: FAQCategory): Promise<FAQ[]> {
    return this.faqRepository.find({
      where: { category, isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async search(query: string): Promise<FAQ[]> {
    return this.faqRepository.find({
      where: [
        { question: Like(`%${query}%`), isPublished: true },
        { answer: Like(`%${query}%`), isPublished: true },
      ],
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number): Promise<FAQ | null> {
    return this.faqRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<FAQ>): Promise<FAQ | null> {
    await this.faqRepository.update(id, data);
    return this.faqRepository.findOneBy({ id });
  }

  async delete(id: number): Promise<void> {
    await this.faqRepository.delete(id);
  }
}
