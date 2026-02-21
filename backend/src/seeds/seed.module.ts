import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Course } from "../courses/courses.entity";
import { User } from "../users/users.entity";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([Course, User])],
  providers: [SeedService],
})
export class SeedModule {}
