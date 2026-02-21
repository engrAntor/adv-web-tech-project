import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LifeBuoy,
  BookOpen,
  MessageCircle,
  Mail,
  PlayCircle,
  Award,
  CreditCard,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';

const helpTopics = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to create an account, set up your profile, and start your first course.',
    links: [
      { label: 'Create an Account', href: '/register' },
      { label: 'Browse Courses', href: '/courses' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    icon: PlayCircle,
    title: 'Courses & Learning',
    description: 'Everything about enrolling in courses, tracking progress, and accessing content.',
    links: [
      { label: 'View All Courses', href: '/courses' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    icon: Award,
    title: 'Certificates',
    description: 'How to earn, download, and share your course completion certificates.',
    links: [
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Information about pricing, payment methods, refunds, and invoices.',
    links: [
      { label: 'View Pricing', href: '/pricing' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    icon: Users,
    title: 'Community & Forums',
    description: 'How to participate in discussions, ask questions, and connect with other learners.',
    links: [
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    icon: Shield,
    title: 'Account & Security',
    description: 'Managing your account settings, password resets, and privacy controls.',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/50 py-8 sm:py-12 md:py-20">
        <div className="container px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
            <LifeBuoy className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Find guides, tutorials, and answers to help you get the most out of our learning platform.
          </p>
        </div>
      </section>

      {/* Help Topics */}
      <section className="container px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <topic.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <CardTitle className="text-base sm:text-lg">{topic.title}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-xs sm:text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section className="border-t bg-muted/50 py-8 sm:py-12 mt-auto">
        <div className="container px-4 sm:px-6 text-center">
          <div className="max-w-lg mx-auto">
            <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Still Need Help?</h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
              Can&apos;t find what you&apos;re looking for? Our support team is ready to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/faq">Browse FAQ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
