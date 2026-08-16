import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { storage } from '../utils/storage';
import { DEMO_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  loginAsDemo: (role: UserRole) => void;
  register: (userData: Partial<User>) => User;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => storage.getCurrentUser());

  useEffect(() => {
    if (user) {
      storage.setCurrentUser(user);
    }
  }, [user]);

  const login = (email: string, preferredRole?: UserRole): boolean => {
    const users = storage.getUsers();
    let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      // Fallback matching by demo role
      if (preferredRole === 'admin') {
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
    return false;
  };

  const loginAsDemo = (targetRole: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === targetRole) || DEMO_USERS[0];
    setUser(target);
    storage.setCurrentUser(target);
  };

  const register = (userData: Partial<User>): User => {
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
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedData };
    setUser(updated);
    storage.saveUser(updated);
    storage.setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'student',
        isAuthenticated: !!user,
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
