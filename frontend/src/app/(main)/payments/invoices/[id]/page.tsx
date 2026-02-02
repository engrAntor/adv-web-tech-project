'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Download,
  Printer,
  Loader2,
  CheckCircle,
  Building,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { paymentService } from '@/services/api.service';
import { Invoice } from '@/types';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceId = Number(params.id);

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await paymentService.getInvoice(invoiceId);
        setInvoice(data);
      } catch (error) {
        console.error('Failed to fetch invoice:', error);
        toast.error('Invoice not found');
        router.push('/payments/invoices');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/payments/invoices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Invoice</h1>
            <p className="text-muted-foreground font-mono">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Card ref={invoiceRef} className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-primary">LMS Platform</h2>
              <p className="text-sm text-muted-foreground mt-1">Online Learning Platform</p>
            </div>
            <div className="text-right">
              <h3 className="text-xl font-bold">INVOICE</h3>
              <p className="text-sm text-muted-foreground">{invoice.invoiceNumber}</p>
              <Badge className="mt-2" variant={invoice.isPaid ? 'default' : 'secondary'}>
                {invoice.isPaid ? 'PAID' : 'PENDING'}
              </Badge>
            </div>
          </div>

          {/* Customer & Invoice Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">BILL TO</h4>
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {invoice.customerName}
                </p>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {invoice.customerEmail}
                </p>
                {invoice.customerPhone && (
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {invoice.customerPhone}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h4 className="font-semibold text-sm text-muted-foreground mb-3">INVOICE DETAILS</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Issue Date: </span>
                  {new Date(invoice.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                {invoice.paidAt && (
                  <p>
                    <span className="text-muted-foreground">Paid Date: </span>
                    {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Payment Method: </span>
                  <span className="capitalize">{invoice.paymentMethod}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Transaction ID: </span>
                  <span className="font-mono">{invoice.transactionId}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border rounded-lg overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Description</th>
                  <th className="text-right p-4 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4">
                    <p className="font-medium">{invoice.courseName}</p>
                    <p className="text-sm text-muted-foreground">Course Enrollment</p>
                  </td>
                  <td className="p-4 text-right">
                    ${Number(invoice.subtotal).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              {Number(invoice.discount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount
                    {invoice.couponCode && (
                      <span className="text-xs ml-1">({invoice.couponCode})</span>
                    )}
                  </span>
                  <span>-${Number(invoice.discount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${Number(invoice.tax).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${Number(invoice.total).toFixed(2)} {invoice.currency}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          {invoice.isPaid && (
            <div className="mt-8 pt-8 border-t text-center">
              <div className="inline-flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Payment Received</span>
              </div>
            </div>
          )}

          {invoice.notes && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

          <div className="mt-8 text-center text-sm text-muted-foreground print:mt-16">
            <p>Thank you for your purchase!</p>
            <p>If you have any questions, please contact support@lmsplatform.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
