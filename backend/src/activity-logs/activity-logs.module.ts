// src/activity-logs/activity-logs.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ActivityLog } from "./activity-log.entity";
import { ActivityLogsService } from "./activity-logs.service";
import { ActivityLogsController } from "./activity-logs.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityLogsService],
  controllers: [ActivityLogsController],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
