import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
//import PageLayout from './PageLayout'; // <-- Import

export default function LandingPage() {
  return (
   // <PageLayout> {/* <--- Wrap content */}
      <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
        {/* ... The rest of your landing page JSX is the same ... */}
        {/* ... just make sure it's inside the PageLayout wrapper ... */}
        <div className="text-center lg:text-start space-y-6">
          <main className="text-5xl md:text-6xl font-bold">
            <h1 className="inline"><span className="inline bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text">Unlock</span> Your Potential</h1>{' '}
            <h2 className="inline">Learn Without <span className="inline bg-gradient-to-r from-purple-500 to-red-500 text-transparent bg-clip-text">Limits</span></h2>
          </main>
          <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">Join thousands of learners on our modern platform. High-quality courses, expert instructors, and a vibrant community await.</p>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button className="w-full md:w-1/3" asChild><Link href="/register">Get Started</Link></Button>
            <Button variant="outline" className="w-full md:w-1/3" asChild><Link href="/courses">Browse Courses</Link></Button>
          </div>
        </div>
        <div className="z-10"><div className="hidden lg:flex w-96 h-96 bg-secondary/80 rounded-full items-center justify-center"><div className="w-72 h-72 bg-background rounded-full items-center justify-center flex"><BookOpen className="w-48 h-48 text-primary" /></div></div></div>
      </section>
    //</PageLayout>
  );
}