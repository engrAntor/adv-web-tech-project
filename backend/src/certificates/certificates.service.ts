// src/certificates/certificates.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './certificate.entity';  // Correct path

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async createCertificate(userId: number, courseId: number): Promise<Certificate> {
    const certificate = this.certificateRepository.create({
      certificateCode: 'CERT-' + Date.now(),  // Using the new name `certificateCode`
      user: { id: userId },
      course: { id: courseId },
    });

    return this.certificateRepository.save(certificate);
  }
}
