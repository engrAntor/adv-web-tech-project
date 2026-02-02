// src/activity-logs/activity-logs.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ActivityLog, ActivityAction } from './activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(
    userId: number | null,
    action: ActivityAction,
    details?: string,
    ipAddress?: string,
    userAgent?: string,
    entityType?: string,
    entityId?: number,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      entityType,
      entityId,
    });
    return this.activityLogRepository.save(log);
  }

  async findAll(
    filters: {
      userId?: number;
      action?: ActivityAction;
      startDate?: Date;
      endDate?: Date;
      entityType?: string;
    },
    limit = 50,
    offset = 0,
  ): Promise<{ logs: ActivityLog[]; total: number }> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      where.createdAt = MoreThanOrEqual(filters.startDate);
    } else if (filters.endDate) {
      where.createdAt = LessThanOrEqual(filters.endDate);
    }

    const [logs, total] = await this.activityLogRepository.findAndCount({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { logs, total };
  }

  async findByUser(userId: number, limit = 20): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async exportLogs(
    filters: {
      userId?: number;
      action?: ActivityAction;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ActivityLog[]> {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;

    if (filters.startDate && filters.endDate) {
      where.createdAt = Between(filters.startDate, filters.endDate);
    }

    return this.activityLogRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
