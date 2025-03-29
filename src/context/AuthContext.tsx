
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

  // Login function that would connect to a backend API
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // This would be an actual API call in a real implementation
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      
      // For demo purposes - simulating a backend response
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulating backend validation
      if (email === 'admin@example.com' && password === 'password') {
        const adminUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin' as const,
          profileImage: '/placeholder.svg'
        };
        setUser(adminUser);
        localStorage.setItem('partitionUser', JSON.stringify(adminUser));
        
        // In real app: store JWT token from backend
        // localStorage.setItem('authToken', response.data.token);
      } else if (email === 'tenant@example.com' && password === 'password') {
        const tenantUser = {
          id: '2',
          name: 'Tenant User',
          email: 'tenant@example.com',
          role: 'tenant' as const,
          profileImage: '/placeholder.svg'
        };
        setUser(tenantUser);
        localStorage.setItem('partitionUser', JSON.stringify(tenantUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Authentication Error",
        description: "Server could not validate your credentials",
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
