// src/payments/dto/payments.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { PaymentMethod, Currency } from "../payment.entity";
import { DiscountType } from "../coupon.entity";

export class InitiatePaymentDto {
  @IsNumber()
  courseId: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}

export class ConfirmPaymentDto {
  @IsString()
  transactionId: string;

  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;

  @IsOptional()
  @IsString()
  bkashTransactionId?: string;
}

export class BkashPaymentDto {
  @IsNumber()
  courseId: number;

  @IsString()
  bkashNumber: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  courseId?: number;

  @IsOptional()
  validFrom?: Date;

  @IsOptional()
  validUntil?: Date;

  @IsOptional()
  @IsNumber()
  usageLimit?: number;

  @IsOptional()
  @IsNumber()
  usageLimitPerUser?: number;
}

export class ApplyCouponDto {
  @IsString()
  couponCode: string;

  @IsNumber()
  courseId: number;
}

export class RefundPaymentDto {
  @IsString()
  reason: string;
}
