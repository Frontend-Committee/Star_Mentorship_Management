import { useLogin, useMe } from '@/features/auth/hooks';
import { clearTokens, getAccessToken } from '@/lib/auth';
import { User } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, ReactNode, useContext, useState } from 'react';

interface AuthContextType {
  user: User | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Determine initial state based on persistent token storage
  const [hasToken, setHasToken] = useState(() => !!getAccessToken());

  // Fetch current user details if a token exists
  const { data: user, isLoading: isUserLoading, isFetched } = useMe({ enabled: hasToken });
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
    setHasToken(true);
  };

  const logout = () => {
    clearTokens();
    setHasToken(false);
    queryClient.removeQueries(); 
    queryClient.setQueryData(['me'], null);
  };

  // 1. If we have a token but haven't successfully fetched the user yet, we are loading.
  // 2. If login is in progress, we are loading.
  const isLoading = (hasToken && !isFetched) || loginMutation.isPending;
  
  // Use either the fetched user object OR the existence of a token as a fallback 
  // to keep the UI 'authenticated' while the user profile loads.
  const isAuthenticated = !!user || (hasToken && !isUserLoading);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
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
