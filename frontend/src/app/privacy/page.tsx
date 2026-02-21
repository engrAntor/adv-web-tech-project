import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Information We Collect',
    content:
      'We collect information you provide directly to us, including: your name, email address, and password when you create an account; profile information such as your bio, phone number, and avatar; course enrollment and progress data; payment information when you make purchases; and any content you post in forums or discussions.',
  },
  {
    title: '2. How We Use Your Information',
    content:
      'We use the information we collect to: provide, maintain, and improve our platform; process transactions and send related information; send you verification emails, OTPs, and account notifications; personalize your learning experience and recommend courses; monitor and analyze usage trends and preferences; and communicate with you about products, services, and events.',
  },
  {
    title: '3. Information Sharing',
    content:
      'We do not sell your personal information to third parties. We may share your information with: course instructors (limited to information necessary for course delivery); service providers who assist in operating our platform (payment processors, email services); law enforcement when required by law or to protect our rights; and other users (only information you choose to make public, such as forum posts).',
  },
  {
    title: '4. Data Security',
    content:
      'We implement industry-standard security measures to protect your personal information, including: encryption of sensitive data in transit and at rest; secure password hashing using bcrypt; JWT-based authentication with token expiration; regular security audits and updates. However, no method of transmission over the internet is 100% secure.',
  },
  {
    title: '5. Cookies & Tracking',
    content:
      'We use cookies and similar technologies to: keep you signed in to your account; remember your preferences; analyze platform usage and performance; and improve our services. You can control cookie settings through your browser preferences.',
  },
  {
    title: '6. Your Rights',
    content:
      'You have the right to: access and download your personal data; update or correct your account information; delete your account and associated data; opt out of marketing communications; request a copy of your data in a portable format. You can exercise these rights through your account settings or by contacting us.',
  },
  {
    title: '7. Data Retention',
    content:
      'We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or legitimate business purposes.',
  },
  {
    title: '8. Children\'s Privacy',
    content:
      'Our platform is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.',
  },
  {
    title: '9. Changes to This Policy',
    content:
      'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting a notice on our platform or sending you an email. Your continued use of the platform after changes take effect constitutes acceptance of the updated policy.',
  },
  {
    title: '10. Contact Us',
    content:
      'If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at engr.antor.3@gmail.com or visit our Contact page.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/50 py-12 sm:py-20">
        <div className="container text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: February 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">{section.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Back */}
      <section className="border-t bg-muted/50 py-8">
        <div className="container text-center">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
