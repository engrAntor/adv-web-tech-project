'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, AuthCredentials } from '@/services/auth.service';
import { userService } from '@/services/api.service';
import { User } from '@/types';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A helper function to read the user data from the JWT token
const decodeToken = (token: string): User | null => {
  try {
    const decoded: { email: string; sub: number; role?: string; exp?: number } = jwtDecode(token);

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log("Token has expired");
      localStorage.removeItem('accessToken');
      return null;
    }

    return { id: decoded.sub, email: decoded.email, role: decoded.role as User['role'] };
  } catch (error) {
    console.error("Failed to decode token:", error);
    localStorage.removeItem('accessToken');
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // This runs when the app first loads to check if the user is already logged in.
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        const decodedUser = decodeToken(storedToken);
        if (decodedUser) {
          setUser(decodedUser);
          setToken(storedToken);
        }
      }
    } catch (error) {
        console.error("Error reading from localStorage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleLogin = async (credentials: AuthCredentials) => {
    const { access_token, refresh_token, user: userData } = await login(credentials);
    console.log('[Auth] Login successful, storing tokens...');
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    // Verify tokens were stored
    const storedToken = localStorage.getItem('accessToken');
    const storedRefresh = localStorage.getItem('refreshToken');
    console.log('[Auth] Tokens stored - Access:', !!storedToken, '| Refresh:', !!storedRefresh);
    // Use the user data from the response, or fallback to decoding the token
    const userInfo = userData || decodeToken(access_token);
    setUser(userInfo);
    setToken(access_token);
    router.push('/dashboard');
  };
  
    const handleRegister = async (credentials: AuthCredentials) => {
    // This function now ONLY calls the API service.
    // It does not log the user in or redirect.
    await register(credentials);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const handleRefreshUser = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(prev => prev ? { ...prev, ...profile } : profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser: handleRefreshUser,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};