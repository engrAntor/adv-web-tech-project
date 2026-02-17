// src/activity-logs/activity-logs.controller.ts
import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { ActivityLogsService } from "./activity-logs.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { UserRole } from "../users/users.entity";
import { ActivityAction } from "./activity-log.entity";

@Controller("activity-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async findAll(
    @Query("userId") userId?: number,
    @Query("action") action?: ActivityAction,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("entityType") entityType?: string,
    @Query("limit") limit = 50,
    @Query("offset") offset = 0,
  ) {
    return this.activityLogsService.findAll(
      {
        userId: userId ? +userId : undefined,
        action,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        entityType,
      },
      +limit,
      +offset,
    );
  }

  @Get("my-activity")
  async getMyActivity(@Request() req: any, @Query("limit") limit = 20) {
    return this.activityLogsService.findByUser(req.user.id, +limit);
  }

  @Get("export")
  @Roles(UserRole.ADMIN, UserRole.ADVISOR)
  async exportLogs(
    @Query("userId") userId?: number,
    @Query("action") action?: ActivityAction,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.activityLogsService.exportLogs({
      userId: userId ? +userId : undefined,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
