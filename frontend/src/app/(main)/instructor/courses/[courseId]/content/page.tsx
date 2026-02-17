import { courseService } from '@/services/api.service';
import InstructorContentClient from '@/components/instructor/InstructorContentClient';

export async function generateStaticParams() {
  try {
    const response = await courseService.getAll({ limit: 100 });
    return response.courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for instructor course content:', error);
    return [];
  }
}

export default function InstructorContentPage() {
  return <InstructorContentClient />;
}
