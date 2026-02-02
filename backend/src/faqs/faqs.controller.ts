// src/faqs/faqs.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/users.entity';
import { FAQCategory } from './faq.entity';

@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Get()
  async findAll(@Query('publishedOnly') publishedOnly = 'true') {
    return this.faqsService.findAll(publishedOnly === 'true');
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return this.faqsService.search(query || '');
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: FAQCategory) {
    return this.faqsService.findByCategory(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.faqsService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async create(
    @Body() body: { question: string; answer: string; category: FAQCategory; sortOrder?: number },
  ) {
    return this.faqsService.create(body.question, body.answer, body.category, body.sortOrder);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async update(@Param('id') id: number, @Body() body: Partial<{ question: string; answer: string; category: FAQCategory; sortOrder: number; isPublished: boolean }>) {
    return this.faqsService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async delete(@Param('id') id: number) {
    await this.faqsService.delete(+id);
    return { success: true };
  }
}
