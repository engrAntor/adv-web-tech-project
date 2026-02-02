// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    link?: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      link,
    });
    return this.notificationRepository.save(notification);
  }

  async findAllByUser(userId: number, limit = 20, offset = 0): Promise<{ notifications: Notification[]; total: number }> {
    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { notifications, total };
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    await this.notificationRepository.update({ id, userId }, { isRead: true });
    return this.notificationRepository.findOneBy({ id, userId });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.notificationRepository.delete({ id, userId });
  }

  async notifyEnrolledStudents(
    userIds: number[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.SYSTEM,
    link?: string,
  ): Promise<void> {
    const notifications = userIds.map(userId => ({
      userId,
      title,
      message,
      type,
      link,
    }));
    await this.notificationRepository.save(notifications);
  }
}
