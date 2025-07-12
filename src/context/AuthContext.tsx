
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
    // Fetch user session from AWS API Gateway
    const fetchUserSession = async () => {
      try {
        // Check localStorage first, then validate with AWS if token exists
        const storedUser = localStorage.getItem('partitionUser');
        const authToken = localStorage.getItem('authToken');
        
        if (storedUser && authToken) {
          // Verify token with AWS API Gateway
          try {
            const response = await fetch('https://your-api-gateway-id.execute-api.region.amazonaws.com/prod/auth/verify', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
            });
            
            if (response.ok) {
              setUser(JSON.parse(storedUser));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('partitionUser');
              localStorage.removeItem('authToken');
            }
          } catch (error) {
            // If verification fails, still use stored user for offline capability
            setUser(JSON.parse(storedUser));
          }
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

  // Login function with AWS API Gateway
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // Replace with your AWS API Gateway endpoint
      const response = await fetch('https://your-api-gateway-id.execute-api.region.amazonaws.com/prod/auth/login', {
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
      // Call AWS API Gateway logout endpoint
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        await fetch('https://your-api-gateway-id.execute-api.region.amazonaws.com/prod/auth/logout', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${authToken}`
          },
        });
      }
      
      // Clear local user data
      setUser(null);
      localStorage.removeItem('partitionUser');
      localStorage.removeItem('authToken');
      
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
