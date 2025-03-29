
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    const storedUser = localStorage.getItem('partitionUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function - would connect to backend in real implementation
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Mock API call - replace with real backend call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes only - hard-coded users
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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('partitionUser');
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
