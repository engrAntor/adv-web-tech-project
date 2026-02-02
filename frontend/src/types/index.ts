// Based on NestJS entities

export enum UserRole {
  USER = 'user',
  INSTRUCTOR = 'instructor',
  ADVISOR = 'advisor',
  ADMIN = 'admin',
}

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CourseCategory {
  WEB_DEVELOPMENT = 'Web Development',
  MOBILE_DEVELOPMENT = 'Mobile Development',
  DATA_SCIENCE = 'Data Science',
  MACHINE_LEARNING = 'Machine Learning',
  CLOUD_COMPUTING = 'Cloud Computing',
  DEVOPS = 'DevOps',
  CYBERSECURITY = 'Cybersecurity',
  DATABASE = 'Database',
  PROGRAMMING = 'Programming',
  DESIGN = 'Design',
  BUSINESS = 'Business',
  SOFTWARE_ENGINEERING = 'Software Engineering',
  INFORMATION_SYSTEMS = 'Information Systems',
  COMPUTER_ENGINEERING = 'Computer Engineering',
  NETWORKING = 'Networking',
  ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
  ELECTRONICS = 'Electronics',
  OTHER = 'Other',
}

export enum CourseDifficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export interface Course {
  id: number;
  title: string;
  description: string;
  syllabus?: string;
  thumbnail?: string;
  previewVideo?: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  duration: number;
  price: number;
  isFree: boolean;
  isPublished: boolean;
  averageRating: number;
  totalRatings: number;
  enrollmentCount: number;
  instructor?: User;
  instructorId?: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProgressStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export interface Progress {
  id: number;
  userId: number;
  courseId: number;
  status: ProgressStatus;
  completionPercentage: number;
  lastAccessedAt?: string;
  completedAt?: string;
  enrolledAt: string;
  course: Course;
  user?: User;
}

export interface Certificate {
  id: number;
  certificateCode: string;
  userId: number;
  courseId: number;
  studentName?: string;
  issuedAt: string;
  expiresAt?: string;
  user?: User;
  course?: Course;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  timeLimit: number;
  passingScore: number;
  allowRetake: boolean;
  maxAttempts: number;
  showCorrectAnswers: boolean;
  isPublished: boolean;
  questions?: Question[];
  course?: Course;
}

export interface Question {
  id: number;
  content: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
  quizId: number;
}

export interface QuizAttempt {
  id: number;
  userId: number;
  quizId: number;
  answers: { questionId: number; selectedAnswer: number }[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeTaken?: number;
  quiz?: Quiz;
}

export interface Forum {
  id: number;
  name: string;
  description?: string;
  courseId?: number;
  isActive: boolean;
  course?: Course;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  authorId: number;
  forumId: number;
  isPinned: boolean;
  isLocked: boolean;
  isBestAnswer: boolean;
  viewCount: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  author?: User;
  forum?: Forum;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  content: string;
  authorId: number;
  postId: number;
  isBestAnswer: boolean;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Rating {
  id: number;
  userId: number;
  courseId: number;
  rating: number;
  review?: string;
  isApproved: boolean;
  createdAt: string;
  user?: User;
  course?: Course;
}

export enum NotificationType {
  COURSE_ENROLLED = 'course_enrolled',
  COURSE_COMPLETED = 'course_completed',
  CERTIFICATE_ISSUED = 'certificate_issued',
  QUIZ_COMPLETED = 'quiz_completed',
  FORUM_REPLY = 'forum_reply',
  PAYMENT_SUCCESS = 'payment_success',
  SYSTEM = 'system',
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export enum FAQCategory {
  ENROLLMENT = 'Enrollment',
  TECHNICAL = 'Technical',
  PAYMENTS = 'Payments',
  CERTIFICATES = 'Certificates',
  GENERAL = 'General',
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: FAQCategory;
  sortOrder: number;
  isPublished: boolean;
}

export enum ContactStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  userId?: number;
  adminResponse?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  action: string;
  details?: string;
  ipAddress?: string;
  entityType?: string;
  entityId?: number;
  createdAt: string;
  user?: User;
}

// Course Content types
export enum ContentType {
  PDF = 'pdf',
  VIDEO = 'video',
  DOCUMENT = 'document',
  LINK = 'link',
}

export interface CourseContent {
  id: number;
  title: string;
  description?: string;
  contentType: ContentType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  externalUrl?: string;
  sortOrder: number;
  duration?: number;
  isPublished: boolean;
  courseId: number;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export enum PaymentMethod {
  STRIPE = 'stripe',
  BKASH = 'bkash',
  VISA_BD = 'visa_bd',
  FREE = 'free',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum Currency {
  USD = 'USD',
  BDT = 'BDT',
}

export interface Payment {
  id: number;
  transactionId: string;
  userId: number;
  courseId: number;
  amount: number;
  discount: number;
  finalAmount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeClientSecret?: string;
  bkashTransactionId?: string;
  couponCode?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
  user?: User;
  course?: Course;
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  courseId?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit: number;
  usedCount: number;
  usageLimitPerUser: number;
  isActive: boolean;
  createdAt: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  userId: number;
  paymentId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  courseName: string;
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  isPaid: boolean;
  paidAt?: string;
  issuedAt: string;
  notes?: string;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
