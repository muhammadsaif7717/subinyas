'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  googleLogin: (credential: string, email?: string, name?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data?.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Login failed';
      return { success: false, message: msg };
    }
  };

  const googleLogin = async (credential: string, email?: string, name?: string) => {
    try {
      const res = await axios.post('/api/auth/google', { credential, email, name });
      if (res.data?.success) {
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Google login failed' };
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Google login error';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/me');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        googleLogin,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
