import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/api';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ user: User }>;
  register: (email: string, password: string, companyName: string, phoneNumber: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('AuthContext: Initial token check:', { hasToken: !!token });
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      console.log('AuthContext: Loading user data from API');
      const userData = await authApi.getCurrentUser();
      console.log('AuthContext: User data loaded successfully:', userData);
      setUser(userData);
    } catch (err) {
      console.error('AuthContext: Failed to load user:', err);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('AuthContext: Attempting login with:', { email });
      
      // ユーザー情報を取得
      const userData = await authApi.getCurrentUser();
      console.log('AuthContext: Login successful, setting user:', userData);
      setUser(userData);
      return { user: userData };
    } catch (err) {
      console.error('AuthContext: Login failed:', err);
      setError(err instanceof Error ? err : new Error('ログインに失敗しました'));
      throw err;
    }
  };

  const register = async (email: string, password: string, companyName: string, phoneNumber: string) => {
    try {
      setError(null);
      const response = await authApi.register({
        email,
        password,
        company_name: companyName,
        phone_number: phoneNumber,
      });
      setUser(response.user);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
