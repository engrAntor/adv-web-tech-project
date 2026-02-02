// src/payment/payment.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe('sk_test_51RemQB2QRDj0NicDV25YNpfCjSncoQCFzBwMtzlSkD4GnhwzNLV8Z8wYkKywePqAAOMhmJPiXzQQL1wW97BCe20200cfqaarIb', {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createPaymentIntent(amount: number) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
  }
}
