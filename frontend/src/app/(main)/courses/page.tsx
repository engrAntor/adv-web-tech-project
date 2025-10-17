'use client';

import { useEffect, useState } from 'react';
import { getCourses, Course } from '@/services/course.service';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        toast.error('Failed to load courses.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const results = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCourses(results);
  }, [searchTerm, courses]);

  if (isLoading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">
            Explore our wide range of available courses.
          </p>
        </div>
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search for a course..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-3 h-[60px]">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* You can add more details like instructor, rating etc. here */}
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  {/* This will link to a dynamic course page we will build later */}
                  <Link href={`/courses/${course.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-3 text-center text-muted-foreground">
            No courses found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}