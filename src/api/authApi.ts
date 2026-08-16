import { apiClient, setAuthToken } from './apiClient';
import type { User, UserRole } from '../types';

export interface AuthResult {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  rollNo?: string;
  department?: string;
  hostel?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export const authApi = {
  /**
   * Register a new student account
   */
  register: async (payload: RegisterPayload): Promise<AuthResult> => {
    const data = await apiClient.post<AuthResult>('/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password || 'password123',
      rollNo: payload.rollNo,
      department: payload.department,
      hostel: payload.hostel,
      phone: payload.phone,
      role: 'student',
    });

    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /**
   * Log in with university credentials
   */
  login: async (payload: LoginPayload): Promise<AuthResult> => {
    const data = await apiClient.post<AuthResult>('/auth/login', {
      email: payload.email,
      password: payload.password || 'password123',
    });

    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /**
   * Instant 1-click Demo Login
   */
  demoLogin: async (role: UserRole): Promise<AuthResult> => {
    const data = await apiClient.post<AuthResult>('/auth/demo-login', { role });

    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /**
   * Retrieve current verified profile from server
   */
  getMe: async (): Promise<User> => {
    const data = await apiClient.get<{ user: User }>('/auth/me');
    return data.user;
  },

  /**
   * Sign out and clear stored tokens
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setAuthToken(null);
    }
  },
};
