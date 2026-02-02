'use client';

import { useEffect, useState } from 'react';
import { courseService } from '@/services/api.service';
import { Course, CourseCategory, CourseDifficulty } from '@/types';
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
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  Search,
  Clock,
  Users,
  Star,
  Filter,
  Loader2,
  BookOpen,
  X,
} from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 12;

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        limit,
        offset: page * limit,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (showFreeOnly) params.isFree = true;

      const data = await courseService.getAll(params);
      setCourses(data.courses);
      setTotal(data.total);
    } catch (error) {
      toast.error('Failed to load courses.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, selectedCategory, selectedDifficulty, showFreeOnly]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchCourses();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setShowFreeOnly(false);
    setPage(0);
  };

  const hasActiveFilters = searchTerm || selectedCategory || selectedDifficulty || showFreeOnly;
  const totalPages = Math.ceil(total / limit);

  const categories = Object.values(CourseCategory);
  const difficulties = Object.values(CourseDifficulty);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">
          Explore our wide range of courses and start learning today
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedCategory || 'all'} onValueChange={(v) => { setSelectedCategory(v === 'all' ? '' : v); setPage(0); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty || 'all'} onValueChange={(v) => { setSelectedDifficulty(v === 'all' ? '' : v); setPage(0); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showFreeOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setShowFreeOnly(!showFreeOnly); setPage(0); }}
          >
            Free Courses
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}

          <div className="ml-auto text-sm text-muted-foreground">
            {total} courses found
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="mb-2">
                      {course.category}
                    </Badge>
                    {course.isFree && (
                      <Badge variant="default" className="bg-green-500">Free</Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {course.duration ? `${Math.round(course.duration / 60)}h` : 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollmentCount}
                    </span>
                    {Number(course.averageRating) > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {Number(course.averageRating).toFixed(1)}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline">{course.difficulty}</Badge>
                  {course.instructor && (
                    <p className="text-sm text-muted-foreground">
                      by {course.instructor.firstName || course.instructor.email}
                    </p>
                  )}
                  {!course.isFree && (
                    <p className="text-lg font-bold text-primary">
                      ${Number(course.price).toFixed(2)}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
