// src/payments/payments.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import Stripe from "stripe";
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
  Currency,
} from "./payment.entity";
import { Coupon, DiscountType } from "./coupon.entity";
import { Invoice } from "./invoice.entity";
import { User } from "../users/users.entity";
import { Course } from "../courses/courses.entity";
import {
  Enrollment,
  PaymentStatus as EnrollmentPaymentStatus,
} from "../enrollments/enrollment.entity";
import { Progress, ProgressStatus } from "../progress/progress.entity";
import { randomBytes } from "crypto";
import { InitiatePaymentDto, CreateCouponDto } from "./dto/payments.dto";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly USD_TO_BDT_RATE = 110; // Approximate exchange rate

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY ||
        "sk_test_51RemQB2QRDj0NicDV25YNpfCjSncoQCFzBwMtzlSkD4GnhwzNLV8Z8wYkKywePqAAOMhmJPiXzQQL1wW97BCe20200cfqaarIb",
      {
        apiVersion: "2025-05-28.basil",
      },
    );
  }

  private generateTransactionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(4).toString("hex").toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = randomBytes(3).toString("hex").toUpperCase();
    return `INV-${year}${month}-${random}`;
  }

  async initiatePayment(
    userId: number,
    dto: InitiatePaymentDto,
  ): Promise<Payment> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const course = await this.courseRepository.findOneBy({ id: dto.courseId });
    if (!course) {
      throw new NotFoundException("Course not found");
    }

    // Check if already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId: dto.courseId },
    });
    if (existingEnrollment) {
      throw new BadRequestException("Already enrolled in this course");
    }

    // Handle free courses
    if (course.isFree || Number(course.price) === 0) {
      return this.handleFreeEnrollment(userId, course);
    }

    // Calculate amount
    const amount = Number(course.price);
    let discount = 0;
    let couponId: number | undefined;

    // Apply coupon if provided
    if (dto.couponCode) {
      const couponResult = await this.validateAndApplyCoupon(
        dto.couponCode,
        course.id,
        userId,
        amount,
      );
      discount = couponResult.discount;
      couponId = couponResult.couponId;
    }

    const finalAmount = Math.max(0, amount - discount);
    const currency = dto.currency || Currency.USD;

    // If final amount is 0 after discount, treat as free
    if (finalAmount === 0) {
      return this.handleFreeEnrollment(userId, course, dto.couponCode);
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      transactionId: this.generateTransactionId(),
      userId,
      courseId: course.id,
      amount,
      discount,
      finalAmount,
      currency,
      paymentMethod: dto.paymentMethod,
      status: PaymentStatus.PENDING,
      couponId,
      couponCode: dto.couponCode,
    });

    // Handle different payment methods
    if (dto.paymentMethod === PaymentMethod.STRIPE) {
      const paymentIntent = await this.createStripePaymentIntent(
        finalAmount,
        currency,
        user.email,
        course.title,
      );
      payment.stripePaymentIntentId = paymentIntent.id;
      payment.stripeClientSecret = paymentIntent.client_secret || undefined;
    } else if (dto.paymentMethod === PaymentMethod.BKASH) {
      // For Bkash, we'll handle the payment confirmation separately
      const amountInBDT =
        currency === Currency.BDT
          ? finalAmount
          : finalAmount * this.USD_TO_BDT_RATE;
      payment.metadata = { amountInBDT: Math.round(amountInBDT) };
    } else if (dto.paymentMethod === PaymentMethod.VISA_BD) {
      // For Bangladeshi Visa cards, we use Stripe with BDT conversion
      const amountInBDT =
        currency === Currency.BDT
          ? finalAmount
          : finalAmount * this.USD_TO_BDT_RATE;
      const paymentIntent = await this.createStripePaymentIntent(
        amountInBDT,
        Currency.BDT,
        user.email,
        course.title,
      );
      payment.stripePaymentIntentId = paymentIntent.id;
      payment.stripeClientSecret = paymentIntent.client_secret || undefined;
      payment.currency = Currency.BDT;
      payment.metadata = { originalAmountUSD: finalAmount };
    }

    await this.paymentRepository.save(payment);
    return payment;
  }

  private async createStripePaymentIntent(
    amount: number,
    currency: Currency,
    email: string,
    description: string,
  ): Promise<Stripe.PaymentIntent> {
    // Stripe amounts are in cents/paisa
    const amountInSmallestUnit = Math.round(amount * 100);

    return this.stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      description,
      receipt_email: email,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async confirmStripePayment(
    transactionId: string,
    stripePaymentIntentId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ["user", "course"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    // Verify with Stripe
    const paymentIntent = await this.stripe.paymentIntents.retrieve(
      stripePaymentIntentId,
    );

    if (paymentIntent.status === "succeeded") {
      payment.status = PaymentStatus.COMPLETED;
      payment.completedAt = new Date();
      await this.paymentRepository.save(payment);

      // Create enrollment and invoice
      await this.createEnrollmentAfterPayment(payment);
      await this.createInvoice(payment);

      // Update coupon usage
      if (payment.couponId) {
        await this.couponRepository.increment(
          { id: payment.couponId },
          "usedCount",
          1,
        );
      }
    } else if (
      paymentIntent.status === "canceled" ||
      paymentIntent.status === "requires_payment_method"
    ) {
      payment.status = PaymentStatus.FAILED;
      payment.failureReason = `Stripe payment ${paymentIntent.status}`;
      await this.paymentRepository.save(payment);
    }

    return payment;
  }

  async confirmBkashPayment(
    transactionId: string,
    bkashTransactionId: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId },
      relations: ["user", "course"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    // In a real implementation, you would verify the Bkash transaction here
    // For now, we'll simulate a successful payment
    payment.bkashTransactionId = bkashTransactionId;
    payment.status = PaymentStatus.COMPLETED;
    payment.completedAt = new Date();
    await this.paymentRepository.save(payment);

    // Create enrollment and invoice
    await this.createEnrollmentAfterPayment(payment);
    await this.createInvoice(payment);

    // Update coupon usage
    if (payment.couponId) {
      await this.couponRepository.increment(
        { id: payment.couponId },
        "usedCount",
        1,
      );
    }

    return payment;
  }

  private async handleFreeEnrollment(
    userId: number,
    course: Course,
    couponCode?: string,
  ): Promise<Payment> {
    const payment = this.paymentRepository.create({
      transactionId: this.generateTransactionId(),
      userId,
      courseId: course.id,
      amount: Number(course.price),
      discount: Number(course.price),
      finalAmount: 0,
      currency: Currency.USD,
      paymentMethod: PaymentMethod.FREE,
      status: PaymentStatus.COMPLETED,
      completedAt: new Date(),
      couponCode,
    });

    await this.paymentRepository.save(payment);
    await this.createEnrollmentAfterPayment(payment);
    await this.createInvoice(payment);

    return payment;
  }

  private async createEnrollmentAfterPayment(payment: Payment): Promise<void> {
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { userId: payment.userId, courseId: payment.courseId },
    });

    if (existingEnrollment) {
      return;
    }

    const enrollment = this.enrollmentRepository.create({
      userId: payment.userId,
      courseId: payment.courseId,
      pricePaid: payment.finalAmount,
      paymentStatus: EnrollmentPaymentStatus.COMPLETED,
      stripePaymentId: payment.stripePaymentIntentId,
      couponCode: payment.couponCode,
    });

    await this.enrollmentRepository.save(enrollment);

    // Create progress record
    const progress = this.progressRepository.create({
      userId: payment.userId,
      courseId: payment.courseId,
      status: ProgressStatus.NOT_STARTED,
      completionPercentage: 0,
    });
    await this.progressRepository.save(progress);

    // Update course enrollment count
    await this.courseRepository.increment(
      { id: payment.courseId },
      "enrollmentCount",
      1,
    );
  }

  private async createInvoice(payment: Payment): Promise<Invoice> {
    const user = await this.userRepository.findOneBy({ id: payment.userId });
    const course = await this.courseRepository.findOneBy({
      id: payment.courseId,
    });

    if (!user || !course) {
      throw new NotFoundException("User or course not found");
    }

    const invoice = this.invoiceRepository.create({
      invoiceNumber: this.generateInvoiceNumber(),
      userId: payment.userId,
      paymentId: payment.id,
      customerName:
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.email,
      customerEmail: user.email,
      customerPhone: user.phone,
      courseName: course.title,
      subtotal: payment.amount,
      discount: payment.discount,
      couponCode: payment.couponCode,
      tax: 0,
      total: payment.finalAmount,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      isPaid: payment.status === PaymentStatus.COMPLETED,
      paidAt: payment.completedAt,
    });

    return this.invoiceRepository.save(invoice);
  }

  async validateAndApplyCoupon(
    couponCode: string,
    courseId: number,
    userId: number,
    originalAmount: number,
  ): Promise<{ discount: number; couponId: number }> {
    const coupon = await this.couponRepository.findOne({
      where: { code: couponCode, isActive: true },
    });

    if (!coupon) {
      throw new BadRequestException("Invalid coupon code");
    }

    // Check validity period
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      throw new BadRequestException("Coupon is not yet valid");
    }
    if (coupon.validUntil && now > coupon.validUntil) {
      throw new BadRequestException("Coupon has expired");
    }

    // Check usage limit
    if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit reached");
    }

    // Check course-specific coupon
    if (coupon.courseId && coupon.courseId !== courseId) {
      throw new BadRequestException("Coupon is not valid for this course");
    }

    // Check minimum purchase amount
    if (
      coupon.minPurchaseAmount &&
      originalAmount < Number(coupon.minPurchaseAmount)
    ) {
      throw new BadRequestException(
        `Minimum purchase amount is ${coupon.minPurchaseAmount}`,
      );
    }

    // Check user usage limit
    const userUsageCount = await this.paymentRepository.count({
      where: { userId, couponId: coupon.id, status: PaymentStatus.COMPLETED },
    });
    if (userUsageCount >= coupon.usageLimitPerUser) {
      throw new BadRequestException("You have already used this coupon");
    }

    // Calculate discount
    let discount: number;
    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = (originalAmount * Number(coupon.discountValue)) / 100;
    } else {
      discount = Number(coupon.discountValue);
    }

    // Apply max discount limit
    if (
      coupon.maxDiscountAmount &&
      discount > Number(coupon.maxDiscountAmount)
    ) {
      discount = Number(coupon.maxDiscountAmount);
    }

    return { discount, couponId: coupon.id };
  }

  async checkCoupon(
    couponCode: string,
    courseId: number,
    userId: number,
  ): Promise<{
    valid: boolean;
    discount?: number;
    discountType?: DiscountType;
    message?: string;
  }> {
    try {
      const course = await this.courseRepository.findOneBy({ id: courseId });
      if (!course) {
        return { valid: false, message: "Course not found" };
      }

      const result = await this.validateAndApplyCoupon(
        couponCode,
        courseId,
        userId,
        Number(course.price),
      );
      const coupon = await this.couponRepository.findOneBy({
        code: couponCode,
      });

      return {
        valid: true,
        discount: result.discount,
        discountType: coupon?.discountType,
      };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }

  async getPaymentByTransactionId(
    transactionId: string,
  ): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { transactionId },
      relations: ["user", "course"],
    });
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ["course"],
      order: { createdAt: "DESC" },
    });
  }

  async getUserInvoices(userId: number): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { userId },
      order: { issuedAt: "DESC" },
    });
  }

  async getInvoice(invoiceId: number, userId: number): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { id: invoiceId, userId },
      relations: ["payment"],
    });
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    return this.invoiceRepository.findOne({
      where: { invoiceNumber },
      relations: ["payment", "user"],
    });
  }

  // Admin methods
  async createCoupon(dto: CreateCouponDto): Promise<Coupon> {
    const existing = await this.couponRepository.findOneBy({ code: dto.code });
    if (existing) {
      throw new BadRequestException("Coupon code already exists");
    }

    const coupon = this.couponRepository.create(dto);
    return this.couponRepository.save(coupon);
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return this.couponRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async getCoupon(id: number): Promise<Coupon | null> {
    return this.couponRepository.findOneBy({ id });
  }

  async updateCoupon(id: number, data: Partial<Coupon>): Promise<Coupon> {
    const coupon = await this.couponRepository.findOneBy({ id });
    if (!coupon) {
      throw new NotFoundException("Coupon not found");
    }

    Object.assign(coupon, data);
    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(id: number): Promise<void> {
    await this.couponRepository.delete(id);
  }

  async getAllPayments(
    limit = 20,
    offset = 0,
  ): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      relations: ["user", "course"],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return { payments, total };
  }

  async refundPayment(paymentId: number, reason: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ["user", "course"],
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException("Only completed payments can be refunded");
    }

    // Refund on Stripe if applicable
    if (payment.stripePaymentIntentId) {
      await this.stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    payment.refundReason = reason;

    await this.paymentRepository.save(payment);

    // Update enrollment
    await this.enrollmentRepository.update(
      { userId: payment.userId, courseId: payment.courseId },
      { paymentStatus: EnrollmentPaymentStatus.REFUNDED },
    );

    return payment;
  }
}
