// src/certificates/certificates.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Certificate } from "./certificate.entity";
import { Progress, ProgressStatus } from "../progress/progress.entity";
import { User } from "../users/users.entity";
import { Course } from "../courses/courses.entity";
import { randomBytes } from "crypto";
import * as PDFDocument from "pdfkit";

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  private generateCertificateCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(4).toString("hex").toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  async createCertificate(
    userId: number,
    courseId: number,
  ): Promise<Certificate> {
    // Check if already has certificate
    const existing = await this.certificateRepository.findOne({
      where: { userId, courseId },
    });

    if (existing) {
      return existing;
    }

    // Check if course is completed
    const progress = await this.progressRepository.findOne({
      where: { userId, courseId },
    });

    if (!progress || progress.status !== ProgressStatus.COMPLETED) {
      throw new BadRequestException(
        "Course must be completed to receive a certificate",
      );
    }

    // Get user and course details
    const user = await this.userRepository.findOneBy({ id: userId });
    const course = await this.courseRepository.findOneBy({ id: courseId });

    if (!user || !course) {
      throw new NotFoundException("User or course not found");
    }

    const certificate = this.certificateRepository.create({
      certificateCode: this.generateCertificateCode(),
      userId,
      courseId,
      studentName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
    });

    return this.certificateRepository.save(certificate);
  }

  async findByUser(userId: number): Promise<Certificate[]> {
    return this.certificateRepository.find({
      where: { userId },
      relations: ["course"],
      order: { issuedAt: "DESC" },
    });
  }

  async findByCode(certificateCode: string): Promise<Certificate | null> {
    return this.certificateRepository.findOne({
      where: { certificateCode },
      relations: ["user", "course"],
    });
  }

  async findOne(id: number): Promise<Certificate | null> {
    return this.certificateRepository.findOne({
      where: { id },
      relations: ["user", "course", "course.instructor"],
    });
  }

  async verifyCertificate(certificateCode: string): Promise<{
    valid: boolean;
    certificate?: Certificate;
    message: string;
  }> {
    const certificate = await this.findByCode(certificateCode);

    if (!certificate) {
      return {
        valid: false,
        message: "Certificate not found",
      };
    }

    if (certificate.expiresAt && new Date() > certificate.expiresAt) {
      return {
        valid: false,
        certificate,
        message: "Certificate has expired",
      };
    }

    return {
      valid: true,
      certificate,
      message: "Certificate is valid",
    };
  }

  async generateCertificateData(certificateId: number): Promise<{
    studentName: string;
    courseName: string;
    certificateCode: string;
    issuedAt: Date;
    courseDescription: string;
  } | null> {
    const certificate = await this.findOne(certificateId);

    if (!certificate) {
      return null;
    }

    return {
      studentName: certificate.studentName || certificate.user.email,
      courseName: certificate.course.title,
      certificateCode: certificate.certificateCode,
      issuedAt: certificate.issuedAt,
      courseDescription: certificate.course.description,
    };
  }

  async generateCertificatePDF(certificateId: number): Promise<Buffer> {
    const certificate = await this.findOne(certificateId);

    if (!certificate) {
      throw new NotFoundException("Certificate not found");
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      // Background gradient effect using rectangles
      doc.rect(0, 0, pageWidth, pageHeight).fill("#fafafa");

      // Border design
      doc
        .strokeColor("#1e40af")
        .lineWidth(3)
        .rect(30, 30, pageWidth - 60, pageHeight - 60)
        .stroke();

      doc
        .strokeColor("#3b82f6")
        .lineWidth(1)
        .rect(40, 40, pageWidth - 80, pageHeight - 80)
        .stroke();

      // Decorative corners
      const cornerSize = 40;
      doc.strokeColor("#1e40af").lineWidth(2);

      // Top-left corner
      doc
        .moveTo(50, 50 + cornerSize)
        .lineTo(50, 50)
        .lineTo(50 + cornerSize, 50)
        .stroke();
      // Top-right corner
      doc
        .moveTo(pageWidth - 50 - cornerSize, 50)
        .lineTo(pageWidth - 50, 50)
        .lineTo(pageWidth - 50, 50 + cornerSize)
        .stroke();
      // Bottom-left corner
      doc
        .moveTo(50, pageHeight - 50 - cornerSize)
        .lineTo(50, pageHeight - 50)
        .lineTo(50 + cornerSize, pageHeight - 50)
        .stroke();
      // Bottom-right corner
      doc
        .moveTo(pageWidth - 50 - cornerSize, pageHeight - 50)
        .lineTo(pageWidth - 50, pageHeight - 50)
        .lineTo(pageWidth - 50, pageHeight - 50 - cornerSize)
        .stroke();

      // Header
      doc
        .fillColor("#1e40af")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("LMS PLATFORM", 0, 80, { align: "center" });

      // Certificate Title
      doc
        .fillColor("#1e3a5f")
        .fontSize(42)
        .font("Helvetica-Bold")
        .text("CERTIFICATE", 0, 120, { align: "center" });

      doc
        .fillColor("#64748b")
        .fontSize(18)
        .font("Helvetica")
        .text("OF COMPLETION", 0, 170, { align: "center" });

      // Divider line
      doc
        .strokeColor("#3b82f6")
        .lineWidth(2)
        .moveTo(pageWidth / 2 - 100, 210)
        .lineTo(pageWidth / 2 + 100, 210)
        .stroke();

      // "This is to certify that" text
      doc
        .fillColor("#475569")
        .fontSize(14)
        .font("Helvetica")
        .text("This is to certify that", 0, 240, { align: "center" });

      // Student Name
      const studentName =
        certificate.studentName || certificate.user?.email || "Student";
      doc
        .fillColor("#1e40af")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text(studentName, 0, 270, { align: "center" });

      // Underline for name
      const nameWidth = doc.widthOfString(studentName);
      doc
        .strokeColor("#3b82f6")
        .lineWidth(1)
        .moveTo((pageWidth - nameWidth) / 2 - 20, 310)
        .lineTo((pageWidth + nameWidth) / 2 + 20, 310)
        .stroke();

      // "has successfully completed" text
      doc
        .fillColor("#475569")
        .fontSize(14)
        .font("Helvetica")
        .text("has successfully completed the course", 0, 330, {
          align: "center",
        });

      // Course Name
      doc
        .fillColor("#1e3a5f")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text(certificate.course.title, 50, 360, {
          align: "center",
          width: pageWidth - 100,
        });

      // Issue Date
      const issuedDate = new Date(certificate.issuedAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );

      doc
        .fillColor("#64748b")
        .fontSize(12)
        .font("Helvetica")
        .text(`Issued on ${issuedDate}`, 0, 420, { align: "center" });

      // Certificate Code
      doc
        .fillColor("#94a3b8")
        .fontSize(10)
        .font("Helvetica")
        .text(`Certificate ID: ${certificate.certificateCode}`, 0, 450, {
          align: "center",
        });

      // Verification URL
      doc
        .fillColor("#3b82f6")
        .fontSize(9)
        .font("Helvetica")
        .text(
          `Verify at: ${process.env.FRONTEND_URL || "http://localhost:3000"}/certificates/verify?code=${certificate.certificateCode}`,
          0,
          470,
          { align: "center" },
        );

      // Signature lines
      const signatureY = 510;
      const leftSignatureX = 150;
      const rightSignatureX = pageWidth - 300;

      // Left signature (Platform)
      doc
        .strokeColor("#1e3a5f")
        .lineWidth(1)
        .moveTo(leftSignatureX, signatureY)
        .lineTo(leftSignatureX + 150, signatureY)
        .stroke();

      doc
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text("LMS Platform", leftSignatureX, signatureY + 10, {
          width: 150,
          align: "center",
        });

      // Right signature (Instructor)
      doc
        .strokeColor("#1e3a5f")
        .lineWidth(1)
        .moveTo(rightSignatureX, signatureY)
        .lineTo(rightSignatureX + 150, signatureY)
        .stroke();

      const instructorName = certificate.course.instructor
        ? `${certificate.course.instructor.firstName || ""} ${certificate.course.instructor.lastName || ""}`.trim() ||
          "Course Instructor"
        : "Course Instructor";

      doc
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text(instructorName, rightSignatureX, signatureY + 10, {
          width: 150,
          align: "center",
        });

      doc.end();
    });
  }

  async findByCodePublic(certificateCode: string): Promise<{
    id: number;
    certificateCode: string;
    studentName: string;
    courseName: string;
    courseDescription: string;
    issuedAt: Date;
    isValid: boolean;
    instructorName?: string;
  } | null> {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateCode },
      relations: ["user", "course", "course.instructor"],
    });

    if (!certificate) {
      return null;
    }

    const isExpired =
      certificate.expiresAt && new Date() > certificate.expiresAt;

    return {
      id: certificate.id,
      certificateCode: certificate.certificateCode,
      studentName:
        certificate.studentName || certificate.user?.email || "Student",
      courseName: certificate.course.title,
      courseDescription: certificate.course.description,
      issuedAt: certificate.issuedAt,
      isValid: !isExpired,
      instructorName: certificate.course.instructor
        ? `${certificate.course.instructor.firstName || ""} ${certificate.course.instructor.lastName || ""}`.trim()
        : undefined,
    };
  }

  async findOneWithInstructor(id: number): Promise<Certificate | null> {
    return this.certificateRepository.findOne({
      where: { id },
      relations: ["user", "course", "course.instructor"],
    });
  }
}
