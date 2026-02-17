'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Smartphone,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Tag,
  Shield,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { courseService, paymentService, enrollmentService } from '@/services/api.service';
import { Course, PaymentMethod, Currency, Payment } from '@/types';
import { toast } from 'sonner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentForm({
  payment,
  onSuccess
}: {
  payment: Payment;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?txn=${payment.transactionId}`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Confirm payment on backend
      try {
        await paymentService.confirmStripePayment(payment.transactionId, paymentIntent.id);
        onSuccess();
      } catch (err) {
        setErrorMessage('Payment confirmation failed');
      }
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {errorMessage}
        </div>
      )}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Pay ${payment.finalAmount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

function BkashPaymentForm({
  payment,
  onSuccess,
}: {
  payment: Payment;
  onSuccess: () => void;
}) {
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxnId, setBkashTxnId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'info' | 'verify'>('info');

  const amountInBDT = payment.metadata?.amountInBDT || Math.round(payment.finalAmount * 110);

  const handleVerify = async () => {
    if (!bkashTxnId.trim()) {
      toast.error('Please enter the Bkash Transaction ID');
      return;
    }

    setIsProcessing(true);
    try {
      await paymentService.confirmBkashPayment(payment.transactionId, bkashTxnId);
      onSuccess();
    } catch (error) {
      toast.error('Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (step === 'info') {
    return (
      <div className="space-y-4">
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <h4 className="font-semibold text-pink-800 mb-2">Bkash Payment Instructions</h4>
          <ol className="text-sm text-pink-700 space-y-2">
            <li>1. Open your Bkash app</li>
            <li>2. Go to "Send Money"</li>
            <li>3. Send <strong>৳{amountInBDT}</strong> to: <strong>01XXXXXXXXX</strong></li>
            <li>4. Use reference: <strong>{payment.transactionId}</strong></li>
            <li>5. After sending, enter the Transaction ID below</li>
          </ol>
        </div>
        <Button onClick={() => setStep('verify')} className="w-full bg-pink-600 hover:bg-pink-700">
          I've Sent the Payment
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Bkash Transaction ID</Label>
        <Input
          placeholder="e.g., 8N7XXXXXX"
          value={bkashTxnId}
          onChange={(e) => setBkashTxnId(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Enter the Transaction ID from your Bkash confirmation message
        </p>
      </div>
      <Button onClick={handleVerify} disabled={isProcessing} className="w-full bg-pink-600 hover:bg-pink-700">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          'Verify Payment'
        )}
      </Button>
      <Button variant="outline" onClick={() => setStep('info')} className="w-full">
        Back
      </Button>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, enrollmentCheck] = await Promise.all([
          courseService.getById(courseId),
          enrollmentService.isEnrolled(courseId),
        ]);
        setCourse(courseData);
        setIsEnrolled(enrollmentCheck.enrolled);

        if (enrollmentCheck.enrolled) {
          toast.info('You are already enrolled in this course');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        toast.error('Course not found');
        router.push('/courses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const result = await paymentService.checkCoupon(couponCode, courseId);
      if (result.valid && result.discount) {
        setDiscount(result.discount);
        setAppliedCoupon(couponCode);
        toast.success(`Coupon applied! You save $${result.discount.toFixed(2)}`);
      } else {
        toast.error(result.message || 'Invalid coupon');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleInitiatePayment = async () => {
    if (!course) return;

    setIsInitiating(true);
    try {
      const paymentData = await paymentService.initiatePayment({
        courseId: course.id,
        paymentMethod,
        couponCode: appliedCoupon || undefined,
        currency: paymentMethod === PaymentMethod.BKASH ? Currency.BDT : Currency.USD,
      });
      setPayment(paymentData);

      // If it's a free enrollment, redirect to success
      if (paymentData.status === 'completed') {
        toast.success('Successfully enrolled!');
        router.push(`/courses/${courseId}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setIsInitiating(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! You are now enrolled.');
    router.push(`/checkout/success?txn=${payment?.transactionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) return null;

  if (isEnrolled) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Already Enrolled!</h1>
        <p className="text-muted-foreground mb-6">
          You are already enrolled in this course.
        </p>
        <Button asChild>
          <Link href={`/courses/${courseId}`}>Go to Course</Link>
        </Button>
      </div>
    );
  }

  const originalPrice = Number(course.price);
  const finalPrice = Math.max(0, originalPrice - discount);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/courses/${courseId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="md:col-span-1 order-2 md:order-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-14 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-14 bg-muted rounded flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-sm line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">{course.difficulty}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>${originalPrice.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section */}
              {!payment && (
                <div className="border-t pt-4">
                  <Label className="text-sm">Have a coupon?</Label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <Button
                        variant="outline"
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>30-day money-back guarantee</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="md:col-span-2 order-1 md:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you'd like to pay</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!payment ? (
                <>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  >
                    <div className="grid gap-4">
                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setPaymentMethod(PaymentMethod.STRIPE)}>
                        <RadioGroupItem value={PaymentMethod.STRIPE} id="stripe" />
                        <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">Credit/Debit Card (International)</p>
                              <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                        </Label>
                        <Badge variant="secondary">Stripe</Badge>
                      </div>

                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setPaymentMethod(PaymentMethod.VISA_BD)}>
                        <RadioGroupItem value={PaymentMethod.VISA_BD} id="visa_bd" />
                        <Label htmlFor="visa_bd" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">Bangladeshi Visa/Mastercard</p>
                              <p className="text-sm text-muted-foreground">Local bank cards (BDT)</p>
                            </div>
                          </div>
                        </Label>
                        <Badge variant="outline">3D Secure</Badge>
                      </div>

                      <div className="flex items-center space-x-4 border rounded-lg p-4 cursor-pointer hover:bg-muted/50"
                        onClick={() => setPaymentMethod(PaymentMethod.BKASH)}>
                        <RadioGroupItem value={PaymentMethod.BKASH} id="bkash" />
                        <Label htmlFor="bkash" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-pink-600" />
                            <div>
                              <p className="font-medium">bKash</p>
                              <p className="text-sm text-muted-foreground">Mobile payment (BDT)</p>
                            </div>
                          </div>
                        </Label>
                        <Badge className="bg-pink-600">Popular</Badge>
                      </div>
                    </div>
                  </RadioGroup>

                  <Button
                    onClick={handleInitiatePayment}
                    disabled={isInitiating}
                    className="w-full"
                    size="lg"
                  >
                    {isInitiating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Continue to Payment - $${finalPrice.toFixed(2)}`
                    )}
                  </Button>
                </>
              ) : payment.paymentMethod === PaymentMethod.BKASH ? (
                <BkashPaymentForm payment={payment} onSuccess={handlePaymentSuccess} />
              ) : payment.stripeClientSecret ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret: payment.stripeClientSecret,
                    appearance: {
                      theme: 'stripe',
                    },
                  }}
                >
                  <StripePaymentForm payment={payment} onSuccess={handlePaymentSuccess} />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">Payment Complete!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  try {
    const response = await courseService.getAll({ limit: 100 });
    return response.courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for checkout:', error);
    return [];
  }
}
