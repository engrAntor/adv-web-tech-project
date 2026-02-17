'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Clock,
    CheckCircle,
    XCircle,
    ArrowLeft,
    ArrowRight,
    Loader2,
    Trophy,
    RotateCcw,
} from 'lucide-react';
import { quizService } from '@/services/api.service';
import { Quiz, Question, QuizAttempt } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function QuizDetailClient() {
    const params = useParams();
    const router = useRouter();
    const quizId = Number(params.quizId);

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [result, setResult] = useState<QuizAttempt | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [showStartDialog, setShowStartDialog] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await quizService.getById(quizId);
                setQuiz(data);
            } catch (error) {
                console.error('Failed to fetch quiz:', error);
                toast.error('Failed to load quiz');
            } finally {
                setIsLoading(false);
            }
        };

        if (quizId) {
            fetchQuiz();
        }
    }, [quizId]);

    useEffect(() => {
        if (attempt && timeLeft > 0 && !showResults) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [attempt, timeLeft, showResults]);

    const handleStart = async () => {
        try {
            const attemptData = await quizService.startAttempt(quizId);
            setAttempt(attemptData);
            setTimeLeft((quiz?.timeLimit || 10) * 60);
            setShowStartDialog(false);
        } catch (error) {
            toast.error('Failed to start quiz');
        }
    };

    const handleAnswerSelect = (questionId: number, answerIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answerIndex,
        }));
    };

    const handleSubmit = async () => {
        if (!attempt) return;

        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId: Number(questionId),
                selectedAnswer,
            }));

            const resultData = await quizService.submitAttempt(attempt.id, formattedAnswers);
            setResult(resultData);
            setShowResults(true);
        } catch (error) {
            toast.error('Failed to submit quiz');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Quiz not found</p>
                <Button asChild className="mt-4">
                    <Link href="/courses">Back to Courses</Link>
                </Button>
            </div>
        );
    }

    if (showResults && result) {
        return (
            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader className="text-center">
                        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${result.passed ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                            {result.passed ? (
                                <Trophy className="h-10 w-10 text-green-600" />
                            ) : (
                                <XCircle className="h-10 w-10 text-red-600" />
                            )}
                        </div>
                        <CardTitle className="text-2xl">
                            {result.passed ? 'Congratulations!' : 'Better luck next time!'}
                        </CardTitle>
                        <CardDescription>
                            {result.passed
                                ? 'You have successfully passed the quiz!'
                                : 'You did not meet the passing score. Try again!'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-primary">{result.score.toFixed(0)}%</p>
                                <p className="text-sm text-muted-foreground">Your Score</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-green-600">{result.correctAnswers}</p>
                                <p className="text-sm text-muted-foreground">Correct</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-3xl font-bold text-red-600">
                                    {result.totalQuestions - result.correctAnswers}
                                </p>
                                <p className="text-sm text-muted-foreground">Incorrect</p>
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Passing Score: {quiz.passingScore}%</p>
                            {result.timeTaken && <p>Time Taken: {formatTime(result.timeTaken)}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center gap-4">
                        {quiz.allowRetake && !result.passed && (
                            <Button onClick={() => window.location.reload()}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <Link href={`/courses/${quiz.courseId}`}>Back to Course</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;

    return (
        <>
            <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{quiz.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {quiz.description && <p className="mb-4">{quiz.description}</p>}
                            <div className="space-y-2 text-sm">
                                <p>Questions: {questions.length}</p>
                                <p>Time Limit: {quiz.timeLimit} minutes</p>
                                <p>Passing Score: {quiz.passingScore}%</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => router.back()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStart}>Start Quiz</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {attempt && currentQuestion && (
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-xl font-bold">{quiz.title}</h1>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-700' : 'bg-muted'
                            }`}>
                            <Clock className="h-4 w-4" />
                            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                            <span>{answeredCount} answered</span>
                        </div>
                        <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
                    </div>

                    {/* Question Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{currentQuestion.content}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={answers[currentQuestion.id]?.toString()}
                                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                            >
                                {currentQuestion.options.map((option, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${answers[currentQuestion.id] === index
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:bg-muted'
                                            }`}
                                        onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                                    >
                                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                                disabled={currentQuestionIndex === 0}
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>

                            {currentQuestionIndex === questions.length - 1 ? (
                                <Button onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Submit Quiz
                                        </>
                                    )}
                                </Button>
                            ) : (
                                <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Question Navigation */}
                    <div className="mt-6 flex flex-wrap gap-2">
                        {questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={currentQuestionIndex === index ? 'default' : 'outline'}
                                size="sm"
                                className={`w-10 h-10 ${answers[questions[index].id] !== undefined && currentQuestionIndex !== index
                                        ? 'bg-green-100 border-green-300 text-green-700'
                                        : ''
                                    }`}
                                onClick={() => setCurrentQuestionIndex(index)}
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
