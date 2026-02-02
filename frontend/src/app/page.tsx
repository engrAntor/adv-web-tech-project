import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Users,
  PlayCircle,
  CheckCircle,
  Star,
  ArrowRight,
  GraduationCap,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Expert-Led Courses',
    description: 'Learn from industry professionals with real-world experience and proven track records.',
  },
  {
    icon: PlayCircle,
    title: 'Learn at Your Pace',
    description: 'Access courses anytime, anywhere. Pause, rewind, and learn on your own schedule.',
  },
  {
    icon: Award,
    title: 'Earn Certificates',
    description: 'Get recognized for your achievements with shareable certificates upon completion.',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Join discussion forums, connect with peers, and get help when you need it.',
  },
  {
    icon: Zap,
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with quizzes and get instant feedback on your progress.',
  },
  {
    icon: Shield,
    title: 'Lifetime Access',
    description: 'Once enrolled, access your courses forever. Learn and revise whenever needed.',
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Software Developer',
    content: 'This platform transformed my career. The courses are well-structured and the instructors are top-notch.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Data Analyst',
    content: 'I completed three certifications here. The practical projects really helped me land my dream job.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    content: 'The community forums are incredibly helpful. I love how engaging the learning experience is.',
    rating: 5,
  },
];

const stats = [
  { value: '10,000+', label: 'Active Learners' },
  { value: '500+', label: 'Courses Available' },
  { value: '100+', label: 'Expert Instructors' },
  { value: '95%', label: 'Satisfaction Rate' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 place-items-center py-12 sm:py-20 md:py-32 gap-8 lg:gap-10">
          <div className="text-center lg:text-start space-y-6">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
              <h1 className="inline">
                <span className="inline bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">
                  Unlock
                </span>{' '}
                Your Potential
              </h1>{' '}
              <span className="inline">
                Learn Without{' '}
                <span className="inline bg-gradient-to-r from-purple-500 to-red-500 text-transparent bg-clip-text">
                  Limits
                </span>
              </span>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Join thousands of learners on our modern platform. High-quality courses, expert
              instructors, and a vibrant community await.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          </div>
          <div className="z-10 hidden lg:block">
            <div className="w-72 xl:w-96 h-72 xl:h-96 bg-secondary/80 rounded-full flex items-center justify-center">
              <div className="w-56 xl:w-72 h-56 xl:h-72 bg-background rounded-full items-center justify-center flex">
                <BookOpen className="w-32 xl:w-48 h-32 xl:h-48 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm sm:text-base text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 sm:py-20" id="features">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base px-4">
            We provide everything you need to succeed in your learning journey.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2 sm:pb-4">
                <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary mb-2" />
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-12 sm:py-20 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Start learning in just a few simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Create an Account</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Sign up for free and set up your learner profile in minutes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Choose Your Course</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Browse our catalog and enroll in courses that match your goals.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl sm:text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Learn at your own pace and earn certificates upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 sm:py-20" id="testimonials">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">What Our Learners Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Join thousands of satisfied learners who have transformed their careers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">&quot;{testimonial.content}&quot;</p>
                <div>
                  <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-12 sm:py-20 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto">
            Join our community of learners today and take the first step towards achieving your
            goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="secondary" className="bg-white/10 border border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 sm:py-12 w-full">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <span className="text-lg sm:text-xl font-bold">LearnHub</span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">
                Empowering learners worldwide with quality education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/courses" className="hover:text-primary">Browse Courses</Link></li>
                <li><Link href="/instructors" className="hover:text-primary">Instructors</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
