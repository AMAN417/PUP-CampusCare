import { apiClient, setAuthToken } from './apiClient';
import type { User, UserRole, Gender } from '../types';

export interface AuthResult {
  user: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  rollNo?: string;
  gender?: Gender;
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
   * Register a new student account — session is issued immediately on success.
   */
  register: async (payload: RegisterPayload): Promise<AuthResult> => {
    const data = await apiClient.post<AuthResult>('/auth/register', {
      name: payload.name,
      email: payload.email,
      password: payload.password || 'password123',
      rollNo: payload.rollNo,
      gender: payload.gender,
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
   * Request password recovery link for email address
   */
  forgotPassword: async (email: string): Promise<{ sent: boolean }> => {
    const data = await apiClient.post<{ sent: boolean }>('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Reset password with new password and verified recovery token/session
   */
  resetPassword: async (password: string, token?: string): Promise<{ updated: boolean }> => {
    const data = await apiClient.post<{ updated: boolean }>(
      '/auth/reset-password',
      { password, token },
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined
    );
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
   * Retrieve current authenticated profile from server
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

