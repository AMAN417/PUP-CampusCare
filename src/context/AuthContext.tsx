import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types';
import { storage } from '../utils/storage';
import { DEMO_USERS } from '../data/mockData';
import { authApi } from '../api/authApi';
import { getAuthToken, setAuthToken } from '../api/apiClient';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password?: string, preferredRole?: UserRole) => Promise<boolean>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  register: (userData: Partial<User>, password?: string) => Promise<User>;
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
      } catch (err) {
        console.warn('Session restoration failed, checking local cache:', err);
        // If token is expired or unauthorized, clear token
        if ((err as any)?.status === 401) {
          setAuthToken(null);
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
    async (email: string, password: string = 'password123', preferredRole?: UserRole): Promise<boolean> => {
      try {
        setLoading(true);
        const result = await authApi.login({ email, password });
        if (result?.user) {
          setUser(result.user);
          storage.setCurrentUser(result.user);
          return true;
        }
      } catch (apiErr: any) {
        console.warn('API login failed, checking fallback:', apiErr);

        // Fallback to local storage for offline / mock testing
        const users = storage.getUsers();
        let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

        if (!found) {
          if (preferredRole === 'admin' || email.includes('admin')) {
            found = DEMO_USERS.find((u) => u.role === 'admin');
          } else {
            found = DEMO_USERS[0];
          }
        }

        if (found) {
          setUser(found);
          storage.setCurrentUser(found);
          return true;
        }
        throw apiErr;
      } finally {
        setLoading(false);
      }
      return false;
    },
    []
  );

  const loginAsDemo = useCallback(async (targetRole: UserRole): Promise<void> => {
    try {
      setLoading(true);
      const result = await authApi.demoLogin(targetRole);
      if (result?.user) {
        setUser(result.user);
        storage.setCurrentUser(result.user);
        return;
      }
    } catch (apiErr) {
      console.warn('API demo login unavailable, using local mock fallback:', apiErr);
      const target = DEMO_USERS.find((u) => u.role === targetRole) || DEMO_USERS[0];
      setUser(target);
      storage.setCurrentUser(target);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (userData: Partial<User>, password: string = 'password123'): Promise<User> => {
      try {
        setLoading(true);
        const result = await authApi.register({
          name: userData.name || 'New Student',
          email: userData.email || `student.${Date.now()}@demo.pup.ac.in`,
          password,
          rollNo: userData.rollNo,
          department: userData.department,
          hostel: userData.hostel,
          phone: userData.phone,
        });

        if (result?.user) {
          setUser(result.user);
          storage.setCurrentUser(result.user);
          return result.user;
        }
      } catch (apiErr: any) {
        console.warn('API registration unavailable, saving to local fallback storage:', apiErr);
        // If it's a conflict or bad request, rethrow so the form can display it
        if (apiErr?.status === 409 || apiErr?.status === 400) {
          throw apiErr;
        }
      } finally {
        setLoading(false);
      }

      // Local fallback creation
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name || 'New Student',
        email: userData.email || `student.${Date.now()}@demo.pup.ac.in`,
        role: (userData.role as UserRole) || 'student',
        rollNo: userData.rollNo || `PUP2026-${Math.floor(1000 + Math.random() * 9000)}`,
        department: userData.department || 'Computer Science & Engineering',
        hostel: userData.hostel || 'Hostel Block A',
        phone: userData.phone || '+91 98000 00000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedDate: new Date().toISOString().slice(0, 10),
        status: 'Active',
      };

      storage.saveUser(newUser);
      setUser(newUser);
      storage.setCurrentUser(newUser);
      return newUser;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAuthToken(null);
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
