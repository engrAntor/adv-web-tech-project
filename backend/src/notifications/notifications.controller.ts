// src/notifications/notifications.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Query, Request, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/users.entity';
import { NotificationType } from './notification.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.notificationsService.findAllByUser(req.user.id, +limit, +offset);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: number, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true };
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req: any) {
    await this.notificationsService.delete(id, req.user.id);
    return { success: true };
  }

  // Notify enrolled students about a new quiz
  @Post('quiz-published')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  async notifyQuizPublished(
    @Body() body: { quizId: number; courseId?: number; quizTitle?: string; courseName?: string },
  ) {
    // This will be handled by the quizzes service when publishing
    // For now, return success - the actual notification logic is in quizzes service
    return { success: true, message: 'Notifications will be sent to enrolled students' };
  }
}
