'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { courseService } from '@/services/api.service';
import { Course } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  Users,
  Star,
  Loader2,
  Settings,
  Eye,
} from 'lucide-react';

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Get all courses by this instructor
        const response = await courseService.getAll({ instructorId: user?.id, limit: 100 });
        setCourses(response.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Manage your courses and their content
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  {!course.isPublished && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
                <CardTitle className="line-clamp-2 mt-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.enrollmentCount} students
                  </span>
                  {Number(course.averageRating) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(course.averageRating).toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link href={`/instructor/courses/${course.id}/content`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Manage Content
                    </Link>
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/courses/${course.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/admin/courses?edit=${course.id}`}>
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't created any courses yet. Contact an admin to create a course.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
