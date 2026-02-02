// src/certificates/certificates.controller.ts
import { Controller, Get, Post, Param, Query, Request, UseGuards, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('my-certificates')
  @UseGuards(JwtAuthGuard)
  async findMyCertificates(@Request() req: any) {
    return this.certificatesService.findByUser(req.user.id);
  }

  @Get('verify')
  async verifyCertificate(@Query('code') code: string) {
    return this.certificatesService.verifyCertificate(code);
  }

  @Get('public/:code')
  async getPublicCertificate(@Param('code') code: string) {
    const certificate = await this.certificatesService.findByCodePublic(code);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    return certificate;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.certificatesService.findOneWithInstructor(+id);
  }

  @Get(':id/data')
  @UseGuards(JwtAuthGuard)
  async getCertificateData(@Param('id') id: number) {
    return this.certificatesService.generateCertificateData(+id);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadCertificate(@Param('id') id: number, @Res() res: Response) {
    const pdfBuffer = await this.certificatesService.generateCertificatePDF(+id);
    const certificate = await this.certificatesService.findOne(+id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${certificate?.certificateCode || id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Get('public/:code/download')
  async downloadPublicCertificate(@Param('code') code: string, @Res() res: Response) {
    const certificate = await this.certificatesService.findByCode(code);
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    const pdfBuffer = await this.certificatesService.generateCertificatePDF(certificate.id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="certificate-${certificate.certificateCode}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Post('generate/:courseId')
  @UseGuards(JwtAuthGuard)
  async generate(@Param('courseId') courseId: number, @Request() req: any) {
    return this.certificatesService.createCertificate(req.user.id, +courseId);
  }
}
