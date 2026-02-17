import { quizService } from '@/services/api.service';
import QuizDetailClient from '@/components/quizzes/QuizDetailClient';

export async function generateStaticParams() {
  try {
    const quizzes = await quizService.getAll();
    return quizzes.map((quiz) => ({
      quizId: quiz.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params for quizzes:', error);
    return [];
  }
}

export default function QuizPage() {
  return <QuizDetailClient />;
}
