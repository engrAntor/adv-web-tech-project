// src/payments/payments.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UserRole } from '../users/users.entity';
import { InitiatePaymentDto, ConfirmPaymentDto, CreateCouponDto, ApplyCouponDto, RefundPaymentDto } from './dto/payments.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ============= User Payment Endpoints =============

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(@Request() req: any, @Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiatePayment(req.user.id, dto);
  }

  @Post('confirm/stripe')
  @UseGuards(JwtAuthGuard)
  async confirmStripePayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmStripePayment(dto.transactionId, dto.stripePaymentIntentId!);
  }

  @Post('confirm/bkash')
  @UseGuards(JwtAuthGuard)
  async confirmBkashPayment(@Body() dto: ConfirmPaymentDto) {
    return this.paymentsService.confirmBkashPayment(dto.transactionId, dto.bkashTransactionId!);
  }

  @Post('check-coupon')
  @UseGuards(JwtAuthGuard)
  async checkCoupon(@Request() req: any, @Body() dto: ApplyCouponDto) {
    return this.paymentsService.checkCoupon(dto.couponCode, dto.courseId, req.user.id);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  async getMyPayments(@Request() req: any) {
    return this.paymentsService.getUserPayments(req.user.id);
  }

  @Get('transaction/:transactionId')
  @UseGuards(JwtAuthGuard)
  async getPaymentByTransaction(@Param('transactionId') transactionId: string) {
    const payment = await this.paymentsService.getPaymentByTransactionId(transactionId);
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  // ============= Invoice Endpoints =============

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  async getMyInvoices(@Request() req: any) {
    return this.paymentsService.getUserInvoices(req.user.id);
  }

  @Get('invoices/:id')
  @UseGuards(JwtAuthGuard)
  async getInvoice(@Param('id') id: number, @Request() req: any) {
    const invoice = await this.paymentsService.getInvoice(+id, req.user.id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  @Get('invoices/number/:invoiceNumber')
  async getInvoiceByNumber(@Param('invoiceNumber') invoiceNumber: string) {
    const invoice = await this.paymentsService.getInvoiceByNumber(invoiceNumber);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  // ============= Admin Coupon Management =============

  @Post('coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.paymentsService.createCoupon(dto);
  }

  @Get('coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllCoupons() {
    return this.paymentsService.getAllCoupons();
  }

  @Get('coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getCoupon(@Param('id') id: number) {
    const coupon = await this.paymentsService.getCoupon(+id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  @Patch('coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCoupon(@Param('id') id: number, @Body() data: Partial<CreateCouponDto>) {
    return this.paymentsService.updateCoupon(+id, data);
  }

  @Delete('coupons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCoupon(@Param('id') id: number) {
    await this.paymentsService.deleteCoupon(+id);
    return { message: 'Coupon deleted successfully' };
  }

  // ============= Admin Payment Management =============

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllPayments(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.paymentsService.getAllPayments(+limit, +offset);
  }

  @Post('admin/refund/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async refundPayment(
    @Param('paymentId') paymentId: number,
    @Body() dto: RefundPaymentDto,
  ) {
    return this.paymentsService.refundPayment(+paymentId, dto.reason);
  }
}
