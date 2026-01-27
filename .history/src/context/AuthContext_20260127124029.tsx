import React, { createContext, useContext, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { useLogin, useMe } from '@/features/auth/hooks';
import { clearTokens } from '@/lib/auth';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const login = async (email: string, password: string) => {
    // We ignore 'role' as it's determined by the backend based on credentials
    await loginMutation.mutateAsync({ email, password });
  };

  const logout = () => {
    clearTokens();
    queryClient.removeQueries(); // Clear all cache
    // Optionally redirect or force state update
    queryClient.setQueryData(['me'], null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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
