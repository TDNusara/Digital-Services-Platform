import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN';
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
  avatarUrl?: string;
  customerProfile?: any;
  workerProfile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  switchDemoAccount: (role: 'ADMIN' | 'CUSTOMER' | 'WORKER') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('taskpulse_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('taskpulse_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error('Failed to load user session:', err);
          localStorage.removeItem('taskpulse_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('taskpulse_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (userData: any): Promise<User> => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('taskpulse_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('taskpulse_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoAccount = async (role: 'ADMIN' | 'CUSTOMER' | 'WORKER') => {
    let email = 'customer@example.com';
    let password = 'Customer@12345';

    if (role === 'ADMIN') {
      email = 'admin@taskpulse.lk';
      password = 'Admin@12345';
    } else if (role === 'WORKER') {
      email = 'worker@example.com';
      password = 'Worker@12345';
    }

    await login(email, password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
