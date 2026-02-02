import apiClient from '@/lib/axios';
import { Course, Progress } from '@/types';

// Function to get all courses from the backend
export const getCourses = async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses'); // This line is failing
    return response.data;
};

// Function to get a single course by its ID
export const getCourseById = async (courseId: number): Promise<Course> => {
    // Note: Your backend doesn't seem to have a GET /courses/:id endpoint.
    // This is a workaround. A dedicated endpoint would be better.
    const courses = await getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) throw new Error("Course not found");
    return course;
};

// Function to get the logged-in user's progress
export const getUserProgress = async (userId: number): Promise<Progress[]> => {
    const response = await apiClient.get<Progress[]>(`/courses/${userId}/progress`);
    return response.data;
};

// Function to enroll the user in a course
export const enrollInCourse = async (userId: number, courseId: number): Promise<Progress> => {
    const response = await apiClient.post<Progress>(`/courses/${userId}/enroll/${courseId}`);
    return response.data;
};

export type { Course, Progress };
