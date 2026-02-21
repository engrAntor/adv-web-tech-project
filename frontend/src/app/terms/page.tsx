import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, ArrowLeft } from 'lucide-react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content:
      'By accessing and using LearnHub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time, and your continued use constitutes acceptance of any changes.',
  },
  {
    title: '2. User Accounts',
    content:
      'To access certain features of our platform, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration and keep your account information up to date.',
  },
  {
    title: '3. Course Enrollment & Access',
    content:
      'When you enroll in a course, you are granted a personal, non-transferable license to access the course content for your own educational purposes. You may not share, distribute, or resell course materials. Course access may be subject to the specific terms of each course, including any time limitations.',
  },
  {
    title: '4. Payments & Refunds',
    content:
      'Paid courses require payment at the time of enrollment. All prices are listed in USD unless otherwise stated. We offer a 30-day refund policy for courses where less than 30% of the content has been accessed. Refund requests can be submitted through your account settings or by contacting support.',
  },
  {
    title: '5. Intellectual Property',
    content:
      'All content on LearnHub, including courses, videos, text, graphics, and logos, is the property of LearnHub or its content creators and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without explicit written permission.',
  },
  {
    title: '6. User Conduct',
    content:
      'You agree not to use the platform to: post or share inappropriate, offensive, or illegal content; harass or intimidate other users; attempt to gain unauthorized access to the platform; use automated tools to scrape or download content; or engage in any activity that disrupts the platform or its services.',
  },
  {
    title: '7. Certificates',
    content:
      'Certificates are awarded upon successful completion of course requirements, including passing any required quizzes or assessments. Certificates represent completion of the course on our platform and should not be misrepresented as accredited degrees or professional certifications unless explicitly stated.',
  },
  {
    title: '8. Community Guidelines',
    content:
      'Participation in forums and community features is subject to our community guidelines. We expect respectful and constructive communication. We reserve the right to remove content and suspend accounts that violate these guidelines without prior notice.',
  },
  {
    title: '9. Limitation of Liability',
    content:
      'LearnHub is provided "as is" without warranties of any kind. We do not guarantee that the platform will be uninterrupted or error-free. In no event shall LearnHub be liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
  },
  {
    title: '10. Termination',
    content:
      'We may terminate or suspend your account at any time for violation of these terms. Upon termination, your right to use the platform ceases immediately. You may also delete your account at any time through your account settings.',
  },
  {
    title: '11. Contact',
    content:
      'If you have any questions about these Terms of Service, please contact us at engr.antor.3@gmail.com or through our Contact page.',
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/50 py-8 sm:py-12 md:py-20">
        <div className="container px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Terms of Service</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Please read these terms carefully before using our platform.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: February 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{section.title}</h2>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                  {section.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Back */}
      <section className="border-t bg-muted/50 py-6 sm:py-8 mt-auto">
        <div className="container px-4 sm:px-6 text-center">
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
