
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'tenant';
  profileImage?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isTenant: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    // Fetch user session from backend API
    const fetchUserSession = async () => {
      try {
        // In a real app, this would be a call to the backend
        // e.g., const response = await fetch('/api/auth/session')
        const storedUser = localStorage.getItem('partitionUser');
        
        if (storedUser) {
          // Simulate verifying the token with the backend
          await new Promise(resolve => setTimeout(resolve, 500));
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to fetch user session:', error);
        localStorage.removeItem('partitionUser');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSession();
  }, []);

  // Login function with backend API
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const user = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          profileImage: data.user.profileImage || '/placeholder.svg'
        };
        
        setUser(user);
        localStorage.setItem('partitionUser', JSON.stringify(user));
        localStorage.setItem('authToken', data.token);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Server could not validate your credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // In real app: call backend logout endpoint
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Simulate backend call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear local user data
      setUser(null);
      localStorage.removeItem('partitionUser');
      // localStorage.removeItem('authToken');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isTenant: user?.role === 'tenant'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
