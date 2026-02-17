// src/payments/payments.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./payment.entity";
import { Coupon } from "./coupon.entity";
import { Invoice } from "./invoice.entity";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { User } from "../users/users.entity";
import { Course } from "../courses/courses.entity";
import { Enrollment } from "../enrollments/enrollment.entity";
import { Progress } from "../progress/progress.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Coupon,
      Invoice,
      User,
      Course,
      Enrollment,
      Progress,
    ]),
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
