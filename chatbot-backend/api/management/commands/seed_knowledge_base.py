"""
Management command to seed the knowledge base with initial documents and FAQs.
"""
from django.core.management.base import BaseCommand
from api.models import Document, FAQ


class Command(BaseCommand):
    help = 'Seed the knowledge base with initial documents and FAQs'

    def handle(self, *args, **options):
        self.stdout.write('Seeding knowledge base...')

        # Seed Documents
        documents = [
            {
                'title': 'Getting Started with LMS Platform',
                'content': '''Welcome to our Learning Management System! To get started:
1. Create an account or log in
2. Browse available courses in the catalog
3. Enroll in courses that interest you
4. Access course materials from your dashboard
5. Complete quizzes and assignments to track progress
6. Earn certificates upon course completion''',
                'category': 'Getting Started'
            },
            {
                'title': 'Course Enrollment Process',
                'content': '''To enroll in a course:
1. Browse the course catalog
2. Click on a course to view details
3. Click "Enroll" or "Add to Cart" for paid courses
4. Complete payment if required
5. Access your enrolled courses from the Dashboard
Note: Some courses may have prerequisites or enrollment limits.''',
                'category': 'Courses'
            },
            {
                'title': 'Certificate Information',
                'content': '''Certificates are awarded upon successful course completion:
- Complete all required lessons and modules
- Pass all quizzes with minimum score (usually 70%)
- Submit all required assignments
- Certificates can be downloaded from your profile
- Certificates include your name, course title, and completion date
- Share certificates on LinkedIn or download as PDF''',
                'category': 'Certificates'
            },
            {
                'title': 'Payment and Refund Policy',
                'content': '''Payment Information:
- We accept credit cards, debit cards, and digital wallets
- Payments are processed securely via Stripe
- Invoices are available in your account

Refund Policy:
- Full refund within 7 days of purchase if no content accessed
- Partial refund (50%) within 14 days
- No refund after 14 days or if more than 50% content completed
- Contact support for refund requests''',
                'category': 'Payments'
            },
            {
                'title': 'Technical Requirements',
                'content': '''System Requirements:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection (minimum 5 Mbps recommended)
- JavaScript enabled
- For video content: HTML5 video support
- Mobile: iOS 12+ or Android 8+

Troubleshooting:
- Clear browser cache if experiencing issues
- Disable ad blockers for best experience
- Check internet connection for video buffering''',
                'category': 'Technical'
            },
        ]

        for doc_data in documents:
            doc, created = Document.objects.get_or_create(
                title=doc_data['title'],
                defaults={
                    'content': doc_data['content'],
                    'category': doc_data['category']
                }
            )
            if created:
                self.stdout.write(f'  Created document: {doc.title}')
            else:
                self.stdout.write(f'  Document exists: {doc.title}')

        # Seed FAQs
        faqs = [
            {
                'question': 'How do I reset my password?',
                'answer': 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox. The reset link expires in 24 hours.',
                'category': 'Account'
            },
            {
                'question': 'Can I access courses on mobile devices?',
                'answer': 'Yes! Our platform is fully responsive and works on smartphones and tablets. You can access all course materials through your mobile browser.',
                'category': 'Technical'
            },
            {
                'question': 'How long do I have access to a course after enrollment?',
                'answer': 'Once enrolled, you have lifetime access to the course materials. You can revisit content anytime, even after completion.',
                'category': 'Courses'
            },
            {
                'question': 'What happens if I fail a quiz?',
                'answer': 'You can retake quizzes multiple times. Your highest score will be recorded. Review the course material before retaking for better results.',
                'category': 'Quizzes'
            },
            {
                'question': 'How do I contact support?',
                'answer': 'Visit the Contact page or email support@lmsplatform.com. Our support team typically responds within 24-48 hours during business days.',
                'category': 'Support'
            },
            {
                'question': 'Can I get a refund for a course?',
                'answer': 'Yes, we offer full refunds within 7 days of purchase if you haven\'t accessed more than 10% of the content. Contact support for refund requests.',
                'category': 'Payments'
            },
            {
                'question': 'How do I download my certificate?',
                'answer': 'Go to Dashboard > Certificates, find your completed course, and click "Download Certificate". You can download as PDF or share directly to LinkedIn.',
                'category': 'Certificates'
            },
            {
                'question': 'Are the certificates recognized by employers?',
                'answer': 'Our certificates demonstrate skill completion and can be shared with employers. Each certificate has a unique verification code that employers can verify.',
                'category': 'Certificates'
            },
        ]

        for faq_data in faqs:
            faq, created = FAQ.objects.get_or_create(
                question=faq_data['question'],
                defaults={
                    'answer': faq_data['answer'],
                    'category': faq_data['category']
                }
            )
            if created:
                self.stdout.write(f'  Created FAQ: {faq.question[:40]}...')
            else:
                self.stdout.write(f'  FAQ exists: {faq.question[:40]}...')

        self.stdout.write(self.style.SUCCESS('Knowledge base seeded successfully!'))
