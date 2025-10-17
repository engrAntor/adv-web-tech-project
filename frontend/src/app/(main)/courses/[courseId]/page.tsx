'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCourseById, enrollInCourse, Course } from '@/services/course.service';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CourseDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const data = await getCourseById(courseId);
          setCourse(data);
        } catch (error) {
          toast.error('Failed to load course details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    if (!user) {
        toast.error("You must be logged in to enroll.");
        return;
    }
    setIsEnrolling(true);
    try {
        await enrollInCourse(user.id, courseId);
        toast.success("Successfully enrolled! Redirecting to dashboard...");
        router.push('/dashboard');
    } catch (error) {
        toast.error("Failed to enroll in the course. You might already be enrolled.");
        console.error(error);
    } finally {
        setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return <div>Loading course...</div>;
  }

  if (!course) {
    return <div>Course not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-muted -mx-8 -mt-8 p-8">
        <div className="container">
            <h1 className="text-4xl font-extrabold">{course.title}</h1>
            <p className="text-lg text-muted-foreground mt-2">A comprehensive journey into {course.title}.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Course Description</CardTitle></CardHeader>
                <CardContent>
                    <p>{course.description}</p>
                </CardContent>
            </Card>
            {/* Add more sections like Syllabus, Quizzes, Forums here */}
        </div>
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Enroll Now</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleEnroll} className="w-full" disabled={isEnrolling}>
                        {isEnrolling ? 'Enrolling...' : 'Enroll in this Course'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}