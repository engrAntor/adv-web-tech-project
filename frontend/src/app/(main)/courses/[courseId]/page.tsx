import { courseService } from '@/services/api.service';
import CourseDetailClient from '@/components/courses/CourseDetailClient';

export async function generateStaticParams() {
  try {
    // Fetch courses for static generation
    // In a real app with many courses, you might limit this or use a different strategy
    const response = await courseService.getAll({ limit: 100 });

    return response.courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for courses:', error);
    return [];
  }
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
