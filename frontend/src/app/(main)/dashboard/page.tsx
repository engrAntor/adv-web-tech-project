'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress as ProgressUI } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookCopy, CheckCircle2, PlayCircle, PlusCircle, ArrowRight, BookOpenCheck, MessageSquare, BarChart3, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { courseService } from '@/services/api.service';
import { Progress } from '@/types';

interface DashboardProgress {
  id: number;
  status: 'In Progress' | 'Completed';
  course: { id: number; title: string; category: string; };
  completionPercentage: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<DashboardProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await courseService.getMyCourses();
        // Transform API data to dashboard format
        const transformedData: DashboardProgress[] = data.map((p: Progress) => ({
          id: p.id,
          status: p.completionPercentage >= 100 ? 'Completed' : 'In Progress',
          course: {
            id: p.course?.id || p.courseId,
            title: p.course?.title || 'Unknown Course',
            category: p.course?.category || 'General',
          },
          completionPercentage: p.completionPercentage || 0,
        }));
        setProgress(transformedData);
      } catch (error) {
        console.error('Failed to load progress:', error);
        toast.error('Failed to load your course progress.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProgress();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const coursesInProgress = progress.filter(p => p.status === 'In Progress');
  const coursesCompleted = progress.filter(p => p.status === 'Completed');

  // --- LOADING SKELETON ---
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Student'}!</h1>
          <p className="text-muted-foreground">Let&apos;s make today a productive day. Here&apos;s your learning overview.</p>
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
              <Button asChild className="mt-4">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* === COMPLETED COURSES SECTION === */}
      {coursesCompleted.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight mb-4">Completed Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesCompleted.map(p => (
              <Card key={p.id} className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <Badge variant="secondary" className="mb-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    {p.course.category}
                  </Badge>
                  <h3 className="text-lg font-bold mb-2">{p.course.title}</h3>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


// === SUB-COMPONENTS FOR A CLEANER DASHBOARD ===

// StatCard Component
const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: React.ElementType, color: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`rounded-full p-2 text-white ${color}`}>
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
const CourseProgressCard = ({ progress }: { progress: DashboardProgress }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
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
    </CardContent>
  </Card>
);

// FeaturePanel Component
const FeaturePanel = () => (
  <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4">
    <FeatureCard title="My Certificates" icon={BookOpenCheck} href="/certificates" />
    <FeatureCard title="Discussion Forums" icon={MessageSquare} href="/forums" />
    <FeatureCard title="Browse Courses" icon={BarChart3} href="/courses" />
    <FeatureCard title="Account Settings" icon={Settings} href="/profile" />
  </div>
);

// FeatureCard Component
const FeatureCard = ({ title, icon: Icon, href }: { title: string, icon: React.ElementType, href: string }) => (
  <Link href={href} className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-colors">
    <div className="rounded-full p-2 bg-primary/10">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">Access now</p>
    </div>
  </Link>
);
