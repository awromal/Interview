'use client';

import React, { createContext, useContext, useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserProfile, JobRole, CandidateLevel } from '@/lib/types/interview';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: {
    name: string;
    email: string;
    targetRole?: JobRole;
    level?: CandidateLevel;
  }) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'interview_user';

function RouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const context = useContext(AuthContext);

  useEffect(() => {
    if (!context || context.isLoading) return;

    const isLoginPage = pathname === '/login';

    if (!context.user && !isLoginPage) {
      // User is not signed in and attempting to access an authenticated route
      router.replace('/login');
    } else if (context.user && isLoginPage) {
      // User is already signed in and landed on login page
      router.replace('/');
    }
  }, [context?.user, context?.isLoading, pathname, router]);

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restore user session on browser load / refresh / back button
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.name && parsed.email) {
            setUser(parsed);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to parse stored user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (data: {
    name: string;
    email: string;
    targetRole?: JobRole;
    level?: CandidateLevel;
  }) => {
    const profile: UserProfile = {
      name: data.name.trim(),
      email: data.email.trim(),
      targetRole: data.targetRole || 'fullstack_developer',
      level: data.level || 'beginner',
      createdAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Failed to write user to localStorage:', err);
    }

    setUser(profile);
    router.replace('/');
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to clear user from localStorage:', err);
    }
    setUser(null);
    router.replace('/login');
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = { ...user, ...data };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err) {
      console.warn('Failed to update user profile in localStorage:', err);
    }
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile }}>
      <Suspense fallback={null}>
        <RouteGuard />
      </Suspense>
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
          <div className="w-10 h-10 rounded-2xl bg-[#f0f4fe] flex items-center justify-center text-[#3b5bf5] shadow-xs mb-3">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs font-medium text-[#82889e] tracking-tight">
            Checking candidate session...
          </span>
        </div>
      ) : (
        children
      )}
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
