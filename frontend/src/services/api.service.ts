import apiClient from '@/lib/axios';
import {
  User,
  Course,
  Progress,
  Certificate,
  Quiz,
  QuizAttempt,
  Forum,
  ForumPost,
  Comment,
  Rating,
  Notification,
  FAQ,
  Contact,
  CourseCategory,
  CourseDifficulty,
  CourseContent,
  ContentType,
  Payment,
  PaymentMethod,
  Currency,
  Invoice,
  Coupon,
  DiscountType,
} from '@/types';

// User Services
export const userService = {
  getProfile: () => apiClient.get<User>('/users/profile').then(res => res.data),
  updateProfile: (data: Partial<User>) => apiClient.patch<User>('/users/profile', data).then(res => res.data),
  updatePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch('/users/password', { currentPassword, newPassword }).then(res => res.data),
  updateAvatar: (avatar: string) => apiClient.patch<User>('/users/avatar', { avatar }).then(res => res.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    // Don't set Content-Type header - axios will set it automatically with correct boundary for FormData
    return apiClient.post<User & { avatarUrl: string }>('/users/avatar/upload', formData).then(res => res.data);
  },
  getInstructors: () => apiClient.get<User[]>('/users/instructors').then(res => res.data),
  getUser: (id: number) => apiClient.get<User>(`/users/${id}`).then(res => res.data),
  // Admin
  getAllUsers: (params?: { limit?: number; offset?: number; search?: string; role?: string }) =>
    apiClient.get<{ users: User[]; total: number }>('/users', { params }).then(res => res.data),
  updateUserRole: (id: number, role: string) => apiClient.patch<User>(`/users/${id}/role`, { role }).then(res => res.data),
  toggleUserActive: (id: number) => apiClient.patch<User>(`/users/${id}/toggle-active`).then(res => res.data),
  deleteUser: (id: number) => apiClient.delete(`/users/${id}`).then(res => res.data),
};

// Course Services
export const courseService = {
  getAll: (params?: {
    category?: CourseCategory;
    difficulty?: CourseDifficulty;
    search?: string;
    minRating?: number;
    isFree?: boolean;
    instructorId?: number;
    limit?: number;
    offset?: number;
  }) => apiClient.get<{ courses: Course[]; total: number }>('/courses', { params }).then(res => res.data),
  getById: (id: number) => apiClient.get<Course>(`/courses/${id}`).then(res => res.data),
  getCategories: () => apiClient.get<string[]>('/courses/categories').then(res => res.data),
  getDifficulties: () => apiClient.get<string[]>('/courses/difficulties').then(res => res.data),
  getPopular: (limit = 10) => apiClient.get<Course[]>(`/courses/popular?limit=${limit}`).then(res => res.data),
  getTopRated: (limit = 10) => apiClient.get<Course[]>(`/courses/top-rated?limit=${limit}`).then(res => res.data),
  getMyCourses: () => apiClient.get<Progress[]>('/courses/my-courses').then(res => res.data),
  getCourseProgress: (courseId: number) => apiClient.get<Progress>(`/courses/${courseId}/progress`).then(res => res.data),
  enroll: (courseId: number) => apiClient.post<Progress>(`/courses/${courseId}/enroll`).then(res => res.data),
  updateProgress: (courseId: number, completionPercentage: number) =>
    apiClient.patch<Progress>(`/courses/${courseId}/progress`, { completionPercentage }).then(res => res.data),
  create: (data: Partial<Course>) => apiClient.post<Course>('/courses', data).then(res => res.data),
  update: (id: number, data: Partial<Course>) => apiClient.patch<Course>(`/courses/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/courses/${id}`).then(res => res.data),
};

// Course Content Services
export const courseContentService = {
  getByCourse: (courseId: number) =>
    apiClient.get<CourseContent[]>(`/course-content/course/${courseId}`).then(res => res.data),
  getAllByCourse: (courseId: number) =>
    apiClient.get<CourseContent[]>(`/course-content/course/${courseId}/all`).then(res => res.data),
  getById: (id: number) =>
    apiClient.get<CourseContent>(`/course-content/${id}`).then(res => res.data),
  create: (courseId: number, data: FormData) =>
    apiClient.post<CourseContent>(`/course-content/course/${courseId}`, data).then(res => res.data),
  update: (id: number, data: FormData | Partial<CourseContent>) =>
    apiClient.patch<CourseContent>(`/course-content/${id}`, data).then(res => res.data),
  delete: (id: number) =>
    apiClient.delete(`/course-content/${id}`).then(res => res.data),
  reorder: (courseId: number, contentIds: number[]) =>
    apiClient.patch(`/course-content/course/${courseId}/reorder`, { contentIds }).then(res => res.data),
  togglePublish: (id: number) =>
    apiClient.patch<CourseContent>(`/course-content/${id}/toggle-publish`).then(res => res.data),
};

// Certificate Services
export interface PublicCertificate {
  id: number;
  certificateCode: string;
  studentName: string;
  courseName: string;
  courseDescription: string;
  issuedAt: string;
  isValid: boolean;
  instructorName?: string;
}

export const certificateService = {
  getMyCertificates: () => apiClient.get<Certificate[]>('/certificates/my-certificates').then(res => res.data),
  verify: (code: string) => apiClient.get<{ valid: boolean; certificate?: Certificate; message: string }>(`/certificates/verify?code=${code}`).then(res => res.data),
  getById: (id: number) => apiClient.get<Certificate>(`/certificates/${id}`).then(res => res.data),
  getData: (id: number) => apiClient.get(`/certificates/${id}/data`).then(res => res.data),
  generate: (courseId: number) => apiClient.post<Certificate>(`/certificates/generate/${courseId}`).then(res => res.data),
  getPublicCertificate: (code: string) => apiClient.get<PublicCertificate>(`/certificates/public/${code}`).then(res => res.data),
  getDownloadUrl: (id: number) => `${apiClient.defaults.baseURL}/certificates/${id}/download`,
  getPublicDownloadUrl: (code: string) => `${apiClient.defaults.baseURL}/certificates/public/${code}/download`,
};

// Quiz Services
export const quizService = {
  getAll: () => apiClient.get<Quiz[]>('/quizzes').then(res => res.data),
  getByCourse: (courseId: number) => apiClient.get<Quiz[]>(`/quizzes/course/${courseId}`).then(res => res.data),
  getById: (id: number) => apiClient.get<Quiz>(`/quizzes/${id}`).then(res => res.data),
  startAttempt: (quizId: number) => apiClient.post<QuizAttempt>(`/quizzes/${quizId}/start`).then(res => res.data),
  submitAttempt: (attemptId: number, answers: { questionId: number; selectedAnswer: number }[]) =>
    apiClient.post<QuizAttempt>(`/quizzes/attempts/${attemptId}/submit`, { answers }).then(res => res.data),
  getAttemptResult: (attemptId: number) => apiClient.get<QuizAttempt>(`/quizzes/attempts/${attemptId}`).then(res => res.data),
  getMyAttempts: (quizId?: number) => apiClient.get<QuizAttempt[]>('/quizzes/my-attempts', { params: { quizId } }).then(res => res.data),
  // Admin
  create: (data: Partial<Quiz>) => apiClient.post<Quiz>('/quizzes', data).then(res => res.data),
  update: (id: number, data: Partial<Quiz>) => apiClient.patch<Quiz>(`/quizzes/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/quizzes/${id}`).then(res => res.data),
  addQuestion: (quizId: number, data: { content: string; options: string[]; correctAnswer: number; explanation?: string; points?: number }) =>
    apiClient.post(`/quizzes/${quizId}/questions`, data).then(res => res.data),
};

// Forum Services
export const forumService = {
  getAll: () => apiClient.get<Forum[]>('/forums').then(res => res.data),
  getById: (id: number) => apiClient.get<Forum>(`/forums/${id}`).then(res => res.data),
  getByCourse: (courseId: number) => apiClient.get<Forum[]>(`/forums/course/${courseId}`).then(res => res.data),
  getPosts: (forumId: number, params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ posts: ForumPost[]; total: number }>(`/forums/${forumId}/posts`, { params }).then(res => res.data),
  getPost: (postId: number) => apiClient.get<ForumPost>(`/forums/posts/${postId}`).then(res => res.data),
  searchPosts: (query: string) => apiClient.get<ForumPost[]>(`/forums/posts/search?q=${query}`).then(res => res.data),
  createPost: (forumId: number, data: { title: string; content: string; tags?: string[] }) =>
    apiClient.post<ForumPost>(`/forums/${forumId}/posts`, data).then(res => res.data),
  updatePost: (postId: number, data: { title?: string; content?: string; tags?: string[] }) =>
    apiClient.patch<ForumPost>(`/forums/posts/${postId}`, data).then(res => res.data),
  deletePost: (postId: number) => apiClient.delete(`/forums/posts/${postId}`).then(res => res.data),
  getComments: (postId: number) => apiClient.get<Comment[]>(`/forums/posts/${postId}/comments`).then(res => res.data),
  createComment: (postId: number, content: string) =>
    apiClient.post<Comment>(`/forums/posts/${postId}/comments`, { content }).then(res => res.data),
  upvoteComment: (commentId: number) => apiClient.post<Comment>(`/forums/comments/${commentId}/upvote`).then(res => res.data),
  // Admin
  createForum: (data: { name: string; description?: string; courseId?: number }) =>
    apiClient.post<Forum>('/forums', data).then(res => res.data),
};

// Rating Services
export const ratingService = {
  getByCourse: (courseId: number, params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ ratings: Rating[]; total: number }>(`/ratings/course/${courseId}`, { params }).then(res => res.data),
  getMyRatings: () => apiClient.get<Rating[]>('/ratings/my-ratings').then(res => res.data),
  getUserCourseRating: (courseId: number) => apiClient.get<Rating>(`/ratings/user-course/${courseId}`).then(res => res.data),
  create: (courseId: number, rating: number, review?: string) =>
    apiClient.post<Rating>('/ratings', { courseId, rating, review }).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/ratings/${id}`).then(res => res.data),
};

// Notification Services
export const notificationService = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ notifications: Notification[]; total: number }>('/notifications', { params }).then(res => res.data),
  getUnreadCount: () => apiClient.get<{ count: number }>('/notifications/unread-count').then(res => res.data),
  markAsRead: (id: number) => apiClient.patch<Notification>(`/notifications/${id}/read`).then(res => res.data),
  markAllAsRead: () => apiClient.post('/notifications/mark-all-read').then(res => res.data),
  delete: (id: number) => apiClient.delete(`/notifications/${id}`).then(res => res.data),
};

// FAQ Services
export const faqService = {
  getAll: () => apiClient.get<FAQ[]>('/faqs').then(res => res.data),
  getByCategory: (category: string) => apiClient.get<FAQ[]>(`/faqs/category/${category}`).then(res => res.data),
  search: (query: string) => apiClient.get<FAQ[]>(`/faqs/search?q=${query}`).then(res => res.data),
  // Admin
  create: (data: { question: string; answer: string; category: string; sortOrder?: number }) =>
    apiClient.post<FAQ>('/faqs', data).then(res => res.data),
  update: (id: number, data: Partial<FAQ>) => apiClient.patch<FAQ>(`/faqs/${id}`, data).then(res => res.data),
  delete: (id: number) => apiClient.delete(`/faqs/${id}`).then(res => res.data),
};

// Contact Services
export const contactService = {
  submit: (data: { name: string; email: string; subject: string; message: string }) =>
    apiClient.post<Contact>('/contact', data).then(res => res.data),
  // Admin
  getAll: (params?: { status?: string; limit?: number; offset?: number }) =>
    apiClient.get<{ contacts: Contact[]; total: number }>('/contact', { params }).then(res => res.data),
  getById: (id: number) => apiClient.get<Contact>(`/contact/${id}`).then(res => res.data),
  updateStatus: (id: number, status: string, adminResponse?: string) =>
    apiClient.patch<Contact>(`/contact/${id}`, { status, adminResponse }).then(res => res.data),
};

// Enrollment Services
export const enrollmentService = {
  getMyEnrollments: () => apiClient.get('/enrollments/my-enrollments').then(res => res.data),
  isEnrolled: (courseId: number) => apiClient.get<{ enrolled: boolean }>(`/enrollments/check/${courseId}`).then(res => res.data),
  enroll: (courseId: number, couponCode?: string) =>
    apiClient.post('/enrollments', { courseId, couponCode }).then(res => res.data),
};

// Activity Log Services (Admin)
export const activityLogService = {
  getAll: (params?: { userId?: number; action?: string; startDate?: string; endDate?: string; limit?: number; offset?: number }) =>
    apiClient.get('/activity-logs', { params }).then(res => res.data),
  getMyActivity: (limit = 20) => apiClient.get(`/activity-logs/my-activity?limit=${limit}`).then(res => res.data),
  export: (params?: { userId?: number; action?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/activity-logs/export', { params }).then(res => res.data),
};

// Payment Services
export const paymentService = {
  // Initiate a payment
  initiatePayment: (data: { courseId: number; paymentMethod: PaymentMethod; couponCode?: string; currency?: Currency }) =>
    apiClient.post<Payment>('/payments/initiate', data).then(res => res.data),

  // Confirm Stripe payment
  confirmStripePayment: (transactionId: string, stripePaymentIntentId: string) =>
    apiClient.post<Payment>('/payments/confirm/stripe', { transactionId, stripePaymentIntentId }).then(res => res.data),

  // Confirm Bkash payment
  confirmBkashPayment: (transactionId: string, bkashTransactionId: string) =>
    apiClient.post<Payment>('/payments/confirm/bkash', { transactionId, bkashTransactionId }).then(res => res.data),

  // Check coupon validity
  checkCoupon: (couponCode: string, courseId: number) =>
    apiClient.post<{ valid: boolean; discount?: number; discountType?: DiscountType; message?: string }>(
      '/payments/check-coupon',
      { couponCode, courseId }
    ).then(res => res.data),

  // Get user's payments
  getMyPayments: () => apiClient.get<Payment[]>('/payments/my-payments').then(res => res.data),

  // Get payment by transaction ID
  getByTransactionId: (transactionId: string) =>
    apiClient.get<Payment>(`/payments/transaction/${transactionId}`).then(res => res.data),

  // Get user's invoices
  getInvoices: () => apiClient.get<Invoice[]>('/payments/invoices').then(res => res.data),

  // Get invoice by ID
  getInvoice: (id: number) => apiClient.get<Invoice>(`/payments/invoices/${id}`).then(res => res.data),

  // Get invoice by number (public)
  getInvoiceByNumber: (invoiceNumber: string) =>
    apiClient.get<Invoice>(`/payments/invoices/number/${invoiceNumber}`).then(res => res.data),

  // Admin: Get all coupons
  getAllCoupons: () => apiClient.get<Coupon[]>('/payments/coupons').then(res => res.data),

  // Admin: Create coupon
  createCoupon: (data: {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchaseAmount?: number;
    maxDiscountAmount?: number;
    courseId?: number;
    validFrom?: string;
    validUntil?: string;
    usageLimit?: number;
    usageLimitPerUser?: number;
  }) => apiClient.post<Coupon>('/payments/coupons', data).then(res => res.data),

  // Admin: Update coupon
  updateCoupon: (id: number, data: Partial<Coupon>) =>
    apiClient.patch<Coupon>(`/payments/coupons/${id}`, data).then(res => res.data),

  // Admin: Delete coupon
  deleteCoupon: (id: number) => apiClient.delete(`/payments/coupons/${id}`).then(res => res.data),

  // Admin: Get all payments
  getAllPayments: (params?: { limit?: number; offset?: number }) =>
    apiClient.get<{ payments: Payment[]; total: number }>('/payments/admin/all', { params }).then(res => res.data),

  // Admin: Refund payment
  refundPayment: (paymentId: number, reason: string) =>
    apiClient.post<Payment>(`/payments/admin/refund/${paymentId}`, { reason }).then(res => res.data),
};
