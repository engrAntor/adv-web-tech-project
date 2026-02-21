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
      <section className="border-b bg-muted/50 py-12 sm:py-20">
        <div className="container text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <LifeBuoy className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Find guides, tutorials, and answers to help you get the most out of our learning platform.
          </p>
        </div>
      </section>

      {/* Help Topics */}
      <section className="container py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-2 bg-primary/10 rounded-lg w-fit mb-2">
                  <topic.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {topic.links.map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
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
      <section className="border-t bg-muted/50 py-12">
        <div className="container text-center">
          <div className="max-w-lg mx-auto">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
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
