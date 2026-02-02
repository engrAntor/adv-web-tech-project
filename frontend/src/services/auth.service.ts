import apiClient from '@/lib/axios';
import { User, AuthResponse } from '@/types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  firstName?: string;
  lastName?: string;
}

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  return response.data;
};

export const verifyPasswordResetOTP = async (email: string, otp: string): Promise<{ token: string; message: string }> => {
  const response = await apiClient.post<{ token: string; message: string }>('/auth/verify-reset-otp', { email, otp });
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/reset-password', { token, password });
  return response.data;
};

export const verifyEmail = async (token: string): Promise<{ message: string }> => {
  const response = await apiClient.get<{ message: string }>(`/auth/verify-email?token=${token}`);
  return response.data;
};

export const verifyEmailOTP = async (email: string, otp: string): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/verify-email-otp', { email, otp });
  return response.data;
};

export const resendVerificationOTP = async (email: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>('/auth/resend-verification-otp', { email });
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
};

export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');
  return response.data;
};
