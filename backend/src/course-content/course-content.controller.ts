// src/course-content/course-content.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CourseContentService } from './course-content.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/users.entity';
import { ContentType } from './course-content.entity';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads', 'course-content');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller('course-content')
export class CourseContentController {
  constructor(private readonly contentService: CourseContentService) {}

  // Get all content for a course (public - only published)
  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: number) {
    return this.contentService.findByCourse(+courseId, false);
  }

  // Get all content for a course (instructor - includes unpublished)
  @Get('course/:courseId/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async findAllByCourse(@Param('courseId') courseId: number) {
    return this.contentService.findByCourse(+courseId, true);
  }

  // Get single content by ID
  @Get(':id')
  async findById(@Param('id') id: number) {
    return this.contentService.findById(+id);
  }

  // Create new content with file upload
  @Post('course/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `content-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Allow PDFs, documents, and videos
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'video/mp4',
          'video/webm',
          'video/quicktime',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type. Allowed: PDF, Word, PowerPoint, Video'), false);
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max
      },
    }),
  )
  async create(
    @Param('courseId') courseId: number,
    @Request() req: any,
    @Body() body: {
      title: string;
      description?: string;
      contentType?: ContentType;
      externalUrl?: string;
      duration?: number;
      sortOrder?: number;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: any = {
      title: body.title,
      description: body.description,
      contentType: body.contentType || ContentType.PDF,
      externalUrl: body.externalUrl,
      duration: body.duration ? +body.duration : undefined,
      sortOrder: body.sortOrder ? +body.sortOrder : undefined,
    };

    if (file) {
      data.fileUrl = `/uploads/course-content/${file.filename}`;
      data.fileName = file.originalname;
      data.fileSize = file.size;

      // Auto-detect content type from file
      if (file.mimetype === 'application/pdf') {
        data.contentType = ContentType.PDF;
      } else if (file.mimetype.startsWith('video/')) {
        data.contentType = ContentType.VIDEO;
      } else {
        data.contentType = ContentType.DOCUMENT;
      }
    }

    return this.contentService.create(+courseId, req.user.id, data);
  }

  // Update content
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `content-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'video/mp4',
          'video/webm',
          'video/quicktime',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param('id') id: number,
    @Request() req: any,
    @Body() body: Partial<{
      title: string;
      description: string;
      contentType: ContentType;
      externalUrl: string;
      duration: number;
      sortOrder: number;
      isPublished: boolean;
    }>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const data: any = { ...body };

    if (file) {
      data.fileUrl = `/uploads/course-content/${file.filename}`;
      data.fileName = file.originalname;
      data.fileSize = file.size;
    }

    return this.contentService.update(+id, req.user.id, data);
  }

  // Delete content
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async delete(@Param('id') id: number, @Request() req: any) {
    await this.contentService.delete(+id, req.user.id);
    return { success: true };
  }

  // Reorder content
  @Patch('course/:courseId/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async reorder(
    @Param('courseId') courseId: number,
    @Request() req: any,
    @Body() body: { contentIds: number[] },
  ) {
    await this.contentService.reorder(+courseId, req.user.id, body.contentIds);
    return { success: true };
  }

  // Toggle publish status
  @Patch(':id/toggle-publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
  async togglePublish(@Param('id') id: number, @Request() req: any) {
    return this.contentService.togglePublish(+id, req.user.id);
  }
}
