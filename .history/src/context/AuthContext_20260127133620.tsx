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
  // Track token existence locally to force re-evaluation of useMe
  const [hasToken, setHasToken] = useState(() => !!getAccessToken());

  const { data: user, isLoading } = useMe({ enabled: hasToken });
  const loginMutation = useLogin();
  const queryClient = useQueryClient();

  const login = async (email: string, password: string) => {
    // We ignore 'role' as it's determined by the backend based on credentials
    await loginMutation.mutateAsync({ email, password });
    setHasToken(true);
  };

  const logout = () => {
    clearTokens();
    setHasToken(false);
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
