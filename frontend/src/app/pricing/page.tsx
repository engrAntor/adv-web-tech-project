import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Zap, Crown, ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with learning.',
    icon: Zap,
    features: [
      'Access to free courses',
      'Community forum access',
      'Basic progress tracking',
      'Course previews',
      'Email support',
    ],
    cta: 'Get Started',
    href: '/register',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'For serious learners who want unlimited access.',
    icon: Crown,
    features: [
      'Unlimited course access',
      'Earn certificates',
      'Interactive quizzes',
      'Priority forum support',
      'Download course materials',
      'Ad-free experience',
      'Priority email support',
    ],
    cta: 'Start Pro Plan',
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For teams and organizations with custom needs.',
    icon: CreditCard,
    features: [
      'Everything in Pro',
      'Custom course creation',
      'Team management dashboard',
      'Analytics & reporting',
      'SSO integration',
      'Dedicated account manager',
      'Custom billing',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/50 py-8 sm:py-12 md:py-20">
        <div className="container px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Choose the plan that fits your learning goals. Start for free, upgrade when you&apos;re ready.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-6 max-w-5xl mx-auto items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg sm:scale-[1.02]' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center px-4 sm:px-6">
                <div className="mx-auto p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <plan.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{plan.description}</CardDescription>
                <div className="pt-3 sm:pt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 px-4 sm:px-6">
                <ul className="space-y-2.5 sm:space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="px-4 sm:px-6">
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ Callout */}
      <section className="border-t bg-muted/50 py-8 sm:py-12 mt-auto">
        <div className="container px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Have Questions?</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
            Check our FAQ or reach out to our support team for more details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/faq">View FAQ</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
