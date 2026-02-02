'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CheckCircle,
  Download,
  ArrowRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { paymentService } from '@/services/api.service';
import { Payment } from '@/types';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get('txn');

  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!transactionId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await paymentService.getByTransactionId(transactionId);
        setPayment(data);
      } catch (error) {
        console.error('Failed to fetch payment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
  }, [transactionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <Card>
        <CardContent className="pt-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. You can now access your course.
          </p>

          {payment && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono">{payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Course</span>
                  <span>{payment.course?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span>${Number(payment.finalAmount).toFixed(2)} {payment.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{payment.paymentMethod}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {payment && (
              <Button asChild className="w-full">
                <Link href={`/courses/${payment.courseId}`}>
                  Start Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button variant="outline" asChild className="w-full">
              <Link href="/payments/invoices">
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/courses">
                Browse More Courses
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
