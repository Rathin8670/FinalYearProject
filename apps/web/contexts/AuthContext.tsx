'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, getStoredTokens, clearTokens, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, name?: string) => Promise<{ success: boolean; message: string }>;
  signin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored tokens on mount
    const tokens = getStoredTokens();
    if (tokens?.user && tokens?.accessToken) {
      setUser(tokens.user);
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const response = await authAPI.signup({ email, password, name });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        router.push('/dashboard');
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signin = async (email: string, password: string) => {
    try {
      const response = await authAPI.signin({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        router.push('/dashboard');
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Signin failed' };
      }
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signout = async () => {
    try {
      await authAPI.signout();
    } catch (error) {
      // Even if API call fails, clear local storage
      console.error('Signout error:', error);
    } finally {
      setUser(null);
      clearTokens();
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signup,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

