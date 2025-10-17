// Based on your NestJS entities

export interface User {
  id: number;
  email: string;
}

export interface Course {
    id: number;
    title: string;
    description: string;
}

export interface Progress {
    id: number;
    status: string;
    course: Course;
    user: User;
}

export interface Certificate {
  id: number;
  certificateCode: string;
  user: User;
  course: Course;
}