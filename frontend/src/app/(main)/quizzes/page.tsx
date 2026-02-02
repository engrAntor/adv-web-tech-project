'use client';

import { useEffect, useState } from 'react';
import { quizService } from '@/services/api.service';
import { Quiz } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Clock,
  FileQuestion,
  Target,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, attemptsData] = await Promise.all([
          quizService.getAll(),
          quizService.getMyAttempts(),
        ]);
        setQuizzes(quizzesData);
        setAttempts(attemptsData);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        toast.error('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAttemptForQuiz = (quizId: number) => {
    return attempts.find((a) => a.quizId === quizId);
  };

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
        <h1 className="text-3xl font-bold">My Quizzes</h1>
        <p className="text-muted-foreground">
          Test your knowledge with course quizzes
        </p>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No quizzes available</h3>
            <p className="text-muted-foreground mb-4">
              Enroll in courses to access their quizzes
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const attempt = getAttemptForQuiz(quiz.id);
            const hasPassed = attempt?.passed;
            const hasAttempted = !!attempt;

            return (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    {hasAttempted && (
                      <Badge
                        variant={hasPassed ? 'default' : 'destructive'}
                        className={hasPassed ? 'bg-green-500' : ''}
                      >
                        {hasPassed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Passed
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-4 w-4" />
                      {quiz.questions?.length || 0} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {quiz.timeLimit} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Passing score: {quiz.passingScore}%
                  </div>
                  {hasAttempted && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">
                        Your score: {attempt.score?.toFixed(0) || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attempt.correctAnswers || 0} / {attempt.totalQuestions || 0} correct
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/quizzes/${quiz.id}`}>
                      {hasAttempted
                        ? hasPassed
                          ? 'Review Quiz'
                          : 'Retry Quiz'
                        : 'Start Quiz'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
