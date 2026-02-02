// src/certificates/certificates.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './certificate.entity';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
import { Progress } from '../progress/progress.entity';
import { User } from '../users/users.entity';
import { Course } from '../courses/courses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate, Progress, User, Course])],
  providers: [CertificatesService],
  controllers: [CertificatesController],
  exports: [CertificatesService],
})
export class CertificatesModule {}
