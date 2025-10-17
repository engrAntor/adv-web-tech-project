'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressUI } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCopy, CheckCircle2, PlayCircle, PlusCircle, ArrowRight, BookOpenCheck, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // <-- We need this new component

// --- SIMULATED DATA (Same as before) ---
interface SimulatedProgress {
  id: number;
  status: 'In Progress' | 'Completed';
  course: { id: number; title: string; category: string; };
  completionPercentage: number;
}
const getSimulatedUserProgress = async (userId: number | undefined): Promise<SimulatedProgress[]> => {
  if (!userId) return [];
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: 1, status: 'In Progress', completionPercentage: 75, course: { id: 1, title: 'Advanced Tailwind CSS', category: 'Web Development' } },
    { id: 2, status: 'In Progress', completionPercentage: 30, course: { id: 2, title: 'Introduction to NestJS', category: 'Backend' } },
    { id: 3, status: 'Completed', completionPercentage: 100, course: { id: 3, title: 'PostgreSQL for Developers', category: 'Database' } },
  ];
};
// --- END OF SIMULATED DATA ---


export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SimulatedProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch data... (same as before)
    if (user) {
      const fetchProgress = async () => {
        try {
          const data = await getSimulatedUserProgress(user.id); setProgress(data);
        } catch (error) { toast.error('Failed to load your course progress.'); }
        finally { setIsLoading(false); }
      };
      fetchProgress();
    }
  }, [user]);

  const coursesInProgress = progress.filter(p => p.status === 'In Progress');
  const coursesCompleted = progress.filter(p => p.status === 'Completed');

  // --- LOADING SKELETON (Same as before) ---
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-3/4 rounded-lg bg-muted"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-32 rounded-xl bg-muted"></div> <div className="h-32 rounded-xl bg-muted"></div>
          <div className="h-32 rounded-xl bg-muted"></div> <div className="h-32 rounded-xl bg-muted"></div>
        </div>
        <div className="h-80 rounded-xl bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* === HEADER === */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.email.split('@')[0]}!</h1>
          <p className="text-muted-foreground">Let's make today a productive day. Here's your learning overview.</p>
        </div>
        <Button asChild>
          <Link href="/courses">
            <PlusCircle className="mr-2 h-4 w-4" /> Explore New Courses
          </Link>
        </Button>
      </header>

      {/* === STATS & FEATURE PANEL === */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Stat Cards */}
        <StatCard title="In Progress" value={coursesInProgress.length} icon={PlayCircle} color="bg-blue-500" />
        <StatCard title="Completed" value={coursesCompleted.length} icon={CheckCircle2} color="bg-green-500" />
        {/* Feature Panel */}
        <FeaturePanel />
      </div>

      {/* === CONTINUE LEARNING SECTION === */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-4">Continue Your Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesInProgress.length > 0 ? (
            coursesInProgress.map(p => <CourseProgressCard key={p.id} progress={p} />)
          ) : (
            <div className="md:col-span-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30 py-20 text-center">
              <BookCopy className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-xl font-semibold">Your Learning Slate is Clean</h3>
              <p className="mt-2 text-muted-foreground">Enroll in a course to start your journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// === SUB-COMPONENTS FOR A CLEANER DASHBOARD ===

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`stat-card-gradient-icon ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">total courses</p>
    </CardContent>
  </Card>
);

// CourseProgressCard Component
const CourseProgressCard = ({ progress }: { progress: SimulatedProgress }) => (
  <div className="course-progress-card p-6">
    <Badge variant="secondary" className="mb-2">{progress.course.category}</Badge>
    <h3 className="text-xl font-bold mb-3">{progress.course.title}</h3>
    <ProgressUI value={progress.completionPercentage} className="h-2 mb-2" />
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{progress.completionPercentage}% Complete</span>
      <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary">
        <Link href={`/courses/${progress.course.id}`}>
          Resume Learning <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
);

// FeaturePanel Component
const FeaturePanel = () => (
  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
    <FeatureCard title="My Certificates" icon={BookOpenCheck} href="/profile/certificates" />
    <FeatureCard title="Discussion Forums" icon={MessageSquare} href="/forums" />
    <FeatureCard title="Track My Progress" icon={BarChart3} href="/progress" />
    <FeatureCard title="Account Settings" icon={Settings} href="/profile" />
  </div>
);

// FeatureCard Component
const FeatureCard = ({ title, icon: Icon, href }: { title: string, icon: React.ElementType, href: string }) => (
  <Link href={href} className="feature-card">
    <Icon className="feature-card-icon" />
    <div className="feature-card-content">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground mt-1">Access now</p>
    </div>
  </Link>
);