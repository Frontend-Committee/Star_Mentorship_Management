import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: Record<string, User> = {
  'admin@star.com': {
    id: '1',
    name: 'Sarah Johnson',
    email: 'admin@star.com',
    role: 'admin',
    committee: 'Technical',
    avatar: undefined,
  },
  'member@star.com': {
    id: '2',
    name: 'Alex Chen',
    email: 'member@star.com',
    role: 'member',
    committee: 'Technical',
    avatar: undefined,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser = mockUsers[email.toLowerCase()];
    if (mockUser) {
      setUser({ ...mockUser, role });
    } else {
      // Create new user for demo
      setUser({
        id: Date.now().toString(),
        name: email.split('@')[0],
        email: email.toLowerCase(),
        role,
        committee: 'Technical',
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
