import { courseService } from '@/services/api.service';
import CheckoutClient from '@/components/checkout/CheckoutClient';

export async function generateStaticParams() {
  try {
    const response = await courseService.getAll({ limit: 100 });
    return response.courses.map((course) => ({
      courseId: course.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for checkout:', error);
    return [];
  }
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
