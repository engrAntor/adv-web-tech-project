'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService, ratingService, quizService, forumService, enrollmentService, courseContentService } from '@/services/api.service';
import { Course, Rating, Quiz, Forum, Progress, CourseContent, ContentType } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Clock,
  Users,
  Award,
  BookOpen,
  PlayCircle,
  MessageSquare,
  FileText,
  Loader2,
  CheckCircle,
  Download,
  File,
  Video,
  ExternalLink,
  Lock,
  CreditCard,
} from 'lucide-react';

export default function CourseDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [forums, setForums] = useState<Forum[]>([]);
  const [courseContent, setCourseContent] = useState<CourseContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [userReview, setUserReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, ratingsData, quizzesData, forumsData, contentData] = await Promise.all([
          courseService.getById(courseId),
          ratingService.getByCourse(courseId, { limit: 5 }),
          quizService.getByCourse(courseId),
          forumService.getByCourse(courseId),
          courseContentService.getByCourse(courseId),
        ]);

        setCourse(courseData);
        setRatings(ratingsData.ratings);
        setQuizzes(quizzesData);
        setForums(forumsData);
        setCourseContent(contentData);

        if (user) {
          try {
            const enrollmentCheck = await enrollmentService.isEnrolled(courseId);
            setIsEnrolled(enrollmentCheck.enrolled);

            if (enrollmentCheck.enrolled) {
              const progressData = await courseService.getCourseProgress(courseId);
              setProgress(progressData);
            }

            try {
              const existingRating = await ratingService.getUserCourseRating(courseId);
              if (existingRating) {
                setUserRating(existingRating.rating);
                setUserReview(existingRating.review || '');
              }
            } catch {}
          } catch (enrollError: any) {
            // Silently handle auth errors - treat as not enrolled
            if (enrollError?.response?.status !== 401) {
              console.error('Failed to check enrollment:', enrollError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load course:', error);
        toast.error('Failed to load course details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error('You must be logged in to enroll.');
      router.push('/login');
      return;
    }

    // If course is paid, redirect to checkout
    if (!course?.isFree && Number(course?.price) > 0) {
      router.push(`/checkout/${courseId}`);
      return;
    }

    // For free courses, enroll directly
    setIsEnrolling(true);
    try {
      await courseService.enroll(courseId);
      setIsEnrolled(true);
      toast.success('Successfully enrolled!');
    } catch (error) {
      toast.error('Failed to enroll. You might already be enrolled.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!user) {
      toast.error('You must be logged in to rate.');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating.');
      return;
    }

    setIsSubmittingRating(true);
    try {
      await ratingService.create(courseId, userRating, userReview);
      toast.success('Thank you for your review!');
      const ratingsData = await ratingService.getByCourse(courseId, { limit: 5 });
      setRatings(ratingsData.ratings);
    } catch (error) {
      toast.error('Failed to submit rating.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Course not found.</p>
        <Button asChild className="mt-4">
          <Link href="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 -mx-8 -mt-8 p-8">
        <div className="container">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{course.category}</Badge>
            <Badge variant="outline">{course.difficulty}</Badge>
            {course.isFree && <Badge variant="secondary" className="bg-green-500 text-white">Free</Badge>}
          </div>
          <h1 className="text-4xl font-extrabold mb-4">{course.title}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6 mt-6">
            {Number(course.averageRating) > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{Number(course.averageRating).toFixed(1)}</span>
                <span className="text-muted-foreground">({course.totalRatings} reviews)</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{course.enrollmentCount} students</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>{course.duration ? `${Math.round(course.duration / 60)} hours` : 'Self-paced'}</span>
            </div>
          </div>

          {course.instructor && (
            <div className="flex items-center gap-3 mt-6">
              <Avatar>
                <AvatarImage src={course.instructor.avatar} />
                <AvatarFallback>{course.instructor.firstName?.[0] || course.instructor.email[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {course.instructor.firstName
                    ? `${course.instructor.firstName} ${course.instructor.lastName || ''}`
                    : course.instructor.email}
                </p>
                <p className="text-sm text-muted-foreground">Instructor</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Course Content</TabsTrigger>
              <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
              <TabsTrigger value="forums">Forums</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{course.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Course Materials
                  </CardTitle>
                  <CardDescription>
                    Access lecture notes, readings, and other course materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courseContent.length > 0 ? (
                    <div className="space-y-3">
                      {courseContent.map((content, index) => (
                        <div
                          key={content.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-3">
                              {content.contentType === ContentType.PDF && (
                                <File className="h-5 w-5 text-red-500" />
                              )}
                              {content.contentType === ContentType.VIDEO && (
                                <Video className="h-5 w-5 text-blue-500" />
                              )}
                              {content.contentType === ContentType.DOCUMENT && (
                                <FileText className="h-5 w-5 text-blue-600" />
                              )}
                              {content.contentType === ContentType.LINK && (
                                <ExternalLink className="h-5 w-5 text-green-500" />
                              )}
                              <div>
                                <h4 className="font-medium">{content.title}</h4>
                                {content.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {content.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {content.contentType.toUpperCase()}
                                  </Badge>
                                  {content.fileSize && (
                                    <span className="text-xs text-muted-foreground">
                                      {(content.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                  )}
                                  {content.duration && content.contentType === ContentType.VIDEO && (
                                    <span className="text-xs text-muted-foreground">
                                      {content.duration} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            {isEnrolled ? (
                              content.fileUrl ? (
                                <Button variant="outline" size="sm" asChild>
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL}${content.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={content.fileName}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                  </a>
                                </Button>
                              ) : content.externalUrl ? (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={content.externalUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open
                                  </a>
                                </Button>
                              ) : null
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Lock className="h-4 w-4 mr-2" />
                                Enroll to Access
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Course materials will be added soon.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="syllabus">
              <Card>
                <CardHeader>
                  <CardTitle>Course Syllabus</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.syllabus ? (
                    <div className="whitespace-pre-wrap">{course.syllabus}</div>
                  ) : (
                    <p className="text-muted-foreground">Syllabus coming soon.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{quiz.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {quiz.questions?.length || 0} questions • {quiz.timeLimit} min • Pass: {quiz.passingScore}%
                          </p>
                        </div>
                        {isEnrolled && (
                          <Button asChild>
                            <Link href={`/quizzes/${quiz.id}`}>Take Quiz</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No quizzes available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="forums" className="space-y-4">
              {forums.length > 0 ? (
                forums.map((forum) => (
                  <Card key={forum.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MessageSquare className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">{forum.name}</h3>
                            <p className="text-sm text-muted-foreground">{forum.description}</p>
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/forums/${forum.id}`}>View Discussions</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No forums available yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              {/* Submit Rating */}
              {isEnrolled && (
                <Card>
                  <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= userRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Write your review (optional)..."
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                    />
                    <Button onClick={handleSubmitRating} disabled={isSubmittingRating}>
                      {isSubmittingRating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              {ratings.length > 0 ? (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <Card key={rating.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {rating.user?.firstName?.[0] || rating.user?.email?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">
                                {rating.user?.firstName || rating.user?.email}
                              </p>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < rating.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {rating.review && (
                              <p className="text-muted-foreground mt-2">{rating.review}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card className="sticky top-4">
            <CardHeader>
              {!course.isFree && (
                <div className="text-3xl font-bold text-primary mb-2">
                  ${Number(course.price).toFixed(2)}
                </div>
              )}
              <CardTitle>{isEnrolled ? 'Continue Learning' : 'Enroll Now'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled ? (
                <>
                  {progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.completionPercentage}%</span>
                      </div>
                      <ProgressBar value={progress.completionPercentage} />
                    </div>
                  )}
                  <Button className="w-full" asChild>
                    <Link href="/dashboard">
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Continue Course
                    </Link>
                  </Button>
                  {progress?.status === 'Completed' && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/certificates">
                        <Award className="mr-2 h-4 w-4" />
                        View Certificate
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <Button onClick={handleEnroll} className="w-full" disabled={isEnrolling}>
                  {isEnrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {course.isFree ? 'Enrolling...' : 'Redirecting...'}
                    </>
                  ) : course.isFree ? (
                    <>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Enroll for Free
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Buy Now
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Course Includes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This course includes:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{course.duration ? `${Math.round(course.duration / 60)} hours` : 'Self-paced'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{courseContent.length} readings/materials</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{quizzes.length} quizzes</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>Discussion forums</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>Certificate of completion</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span>Lifetime access</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
