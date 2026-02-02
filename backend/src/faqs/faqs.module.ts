// src/faqs/faqs.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FAQ } from './faq.entity';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FAQ])],
  providers: [FaqsService],
  controllers: [FaqsController],
  exports: [FaqsService],
})
export class FaqsModule {}
