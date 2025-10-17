import apiClient from '@/lib/axios';
import { User } from '@/types';

// Defines the data needed for login/register
export interface AuthCredentials {
  email: string;
  password: string;
}

// Defines the expected response from the backend after a successful login/register
export interface AuthResponse {
  access_token: string;
}

// Function to call the backend's /auth/login endpoint
export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// Function to call the backend's /auth/register endpoint
export const register = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return response.data;
};