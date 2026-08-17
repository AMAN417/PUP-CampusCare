import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { storage } from '../utils/storage';
import { DEMO_USERS } from '../data/mockData';
import { authApi } from '../api/authApi';
import type { AuthResult } from '../api/authApi';
import { getAuthToken, setAuthToken } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  loginAsDemo: (role: UserRole) => Promise<User | null>;
  register: (userData: Partial<User>, password?: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  // Restore authenticated session from API on initial mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getMe();
        if (isMounted && currentUser) {
          setUser(currentUser);
          storage.setCurrentUser(currentUser);
        }
      } catch (err: any) {
        console.warn('Session restoration failed:', err);
        // If token is expired or unauthorized, clear session
        if (err?.status === 401 || err?.status === 403) {
          setAuthToken(null);
          setUser(null);
          storage.setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      storage.setCurrentUser(user);
    }
  }, [user]);

  const login = useCallback(
    async (email: string, password: string = 'password123'): Promise<User | null> => {
      try {
        const result = await authApi.login({ email, password });

        if (result?.user && result?.token) {
          setUser(result.user);
          storage.setCurrentUser(result.user);
          return result.user;
        }
      } catch (apiErr: any) {
        setAuthToken(null);
        setUser(null);
        storage.setCurrentUser(null);
        throw apiErr;
      }
      return null;
    },
    []
  );

  const loginAsDemo = useCallback(async (targetRole: UserRole): Promise<User | null> => {
    try {
      const result = await authApi.demoLogin(targetRole);
      if (result?.user) {
        setUser(result.user);
        storage.setCurrentUser(result.user);
        return result.user;
      }
    } catch (apiErr) {
      console.warn('API demo login unavailable, using local mock fallback:', apiErr);
      const target = DEMO_USERS.find((u) => u.role === targetRole) || DEMO_USERS[0];
      setUser(target);
      storage.setCurrentUser(target);
      return target;
    }
    return null;
  }, []);

  const register = useCallback(
    async (userData: Partial<User>, password: string = 'password123'): Promise<AuthResult> => {
      const result = await authApi.register({
        name: userData.name || 'New Student',
        email: userData.email || `student.${Date.now()}@demo.pup.ac.in`,
        password,
        rollNo: userData.rollNo,
        department: userData.department,
        hostel: userData.hostel,
        phone: userData.phone,
      });

      // If a token was issued, set the session immediately — no verification gate
      if (result?.user && result?.token) {
        setUser(result.user);
        storage.setCurrentUser(result.user);
      }

      return result;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAuthToken(null);
      storage.setCurrentUser(null);
    }
  }, []);

  const updateProfile = useCallback(
    (updatedData: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...updatedData };
      setUser(updated);
      storage.saveUser(updated);
      storage.setCurrentUser(updated);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'student',
        isAuthenticated: !!user,
        loading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
