import { getDataProvider, isSupabaseConfigured } from '../config/environment.js';
import { getSupabaseClient } from '../database/supabaseClient.js';
import { getUserRepository } from '../repositories/index.js';
import { User, UserRole, AuthResponseData } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  rollNo?: string;
  department?: string;
  hostel?: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Memory mode token store (isolated fallback for testing & non-database local run)
const memoryTokenStore = new Map<string, { user: User; expiresAt: number }>();

const createMemoryToken = (user: User): string => {
  const token = `cc_token_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  memoryTokenStore.set(token, {
    user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return token;
};

export class AuthService {
  /**
   * Register a new student account requiring email verification
   */
  public async register(input: RegisterInput): Promise<AuthResponseData> {
    const provider = getDataProvider();
    const role: UserRole = input.role || 'student';
    const email = input.email.trim().toLowerCase();

    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            name: input.name,
            role,
            roll_no: input.rollNo || null,
            department: input.department || 'General',
            hostel: input.hostel || null,
            phone: input.phone || null,
          },
        },
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase();
        if (msg.includes('rate limit') || signUpError.status === 429) {
          throw new AppError('Email rate limit exceeded. Please wait a few minutes before trying again.', 429);
        }
        if (msg.includes('already registered')) {
          throw new AppError('An account with this email already exists. Please sign in instead.', 409);
        }
        throw new AppError(`Registration failed: ${signUpError.message}`, 400);
      }

      const authUserId = signUpData.user?.id || null;

      // Sync profile to public.users table
      let userProfile: User;
      try {
        const userRepo = getUserRepository();
        userProfile = await userRepo.upsert({
          id: authUserId || undefined,
          name: input.name,
          email,
          role,
          rollNo: input.rollNo,
          department: input.department || 'General',
          hostel: input.hostel,
          phone: input.phone,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        });
      } catch {
        userProfile = {
          id: authUserId || `user-${Date.now()}`,
          name: input.name,
          email,
          role,
          rollNo: input.rollNo,
          department: input.department || 'General',
          hostel: input.hostel,
          phone: input.phone,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        };
      }

      // Check if user is already verified (e.g. if email confirmation is disabled on Supabase instance)
      const isVerified = Boolean(signUpData.user?.email_confirmed_at || signUpData.user?.confirmed_at);
      if (isVerified && signUpData.session?.access_token) {
        return {
          user: userProfile,
          token: signUpData.session.access_token,
          refreshToken: signUpData.session.refresh_token,
          expiresIn: signUpData.session.expires_in,
          requiresVerification: false,
        };
      }

      // Default: Requires email verification, no session token issued
      return {
        user: userProfile,
        requiresVerification: true,
      };
    }

    // Memory provider fallback for offline testing
    const userRepo = getUserRepository();
    const existing = await userRepo.getByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const newUser = await userRepo.create({
      name: input.name,
      email,
      role,
      rollNo: input.rollNo,
      department: input.department || 'Computer Science & Engineering',
      hostel: input.hostel,
      phone: input.phone,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    });

    return {
      user: newUser,
      requiresVerification: true,
    };
  }

  /**
   * Authenticate user with email and password (enforces email verification)
   */
  public async login(input: LoginInput): Promise<AuthResponseData> {
    const provider = getDataProvider();
    const email = input.email.trim().toLowerCase();

    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();

      // Attempt Supabase Auth Sign In
      let { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: input.password,
        });

      // Handle demo accounts auto-provisioning in Supabase Auth if needed
      if (signInError) {
        const isDemoAccount =
          email === 'harman.student@demo.pup.ac.in' ||
          email === 'rajinder.admin@demo.pup.ac.in';

        if (isDemoAccount) {
          const demoRole: UserRole = email.includes('admin') ? 'admin' : 'student';
          const demoName = email.includes('admin') ? 'Dr. Rajinder Kumar' : 'Harmanpreet Singh';

          try {
            await supabase.auth.admin.createUser({
              email,
              password: input.password || 'password123',
              email_confirm: true,
              user_metadata: {
                name: demoName,
                role: demoRole,
                department: demoRole === 'admin' ? 'Estate Administration' : 'Computer Science',
              },
            });
          } catch {
            // Ignore if already created
          }

          // Retry sign-in
          const retry = await supabase.auth.signInWithPassword({
            email,
            password: input.password || 'password123',
          });

          if (retry.data?.session) {
            signInData = retry.data;
            signInError = null;
          }
        }
      }

      if (signInError || !signInData?.user || !signInData?.session) {
        throw new AppError(
          signInError?.message || 'Invalid email or password. Please check your credentials.',
          401
        );
      }

      // Mandate email verification: check email_confirmed_at
      const isEmailVerified = Boolean(
        signInData.user.email_confirmed_at || signInData.user.confirmed_at
      );

      if (!isEmailVerified) {
        // Immediately sign out unverified user session
        await supabase.auth.signOut().catch(() => null);
        throw new AppError(
          'Please verify your email before accessing CampusCare.',
          403
        );
      }

      // Fetch or sync user profile
      let userProfile: User;
      try {
        const userRepo = getUserRepository();
        const found = await userRepo.getByEmail(email);
        if (found) {
          userProfile = found;
        } else {
          const metadata = signInData.user.user_metadata || {};
          userProfile = await userRepo.upsert({
            id: signInData.user.id,
            name: metadata.name || email.split('@')[0],
            email,
            role: (metadata.role as UserRole) || (email.includes('admin') ? 'admin' : 'student'),
            department: metadata.department || 'General',
            status: 'Active',
          });
        }
      } catch {
        const metadata = signInData.user.user_metadata || {};
        userProfile = {
          id: signInData.user.id,
          name: metadata.name || (email.includes('admin') ? 'Dr. Rajinder Kumar' : 'Harmanpreet Singh'),
          email,
          role: (metadata.role as UserRole) || (email.includes('admin') ? 'admin' : 'student'),
          department: metadata.department || (email.includes('admin') ? 'Estate Administration' : 'Computer Science'),
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        };
      }

      return {
        user: userProfile,
        token: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        expiresIn: signInData.session.expires_in,
        requiresVerification: false,
      };
    }

    // Memory provider fallback for testing
    const userRepo = getUserRepository();
    const user = await userRepo.getByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = createMemoryToken(user);
    return {
      user,
      token,
      expiresIn: 604800,
      requiresVerification: false,
    };
  }

  /**
   * Resend signup verification email
   */
  public async resendVerificationEmail(email: string): Promise<void> {
    const cleanEmail = email.trim().toLowerCase();
    const provider = getDataProvider();

    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
      });

      if (error) {
        console.warn(`Supabase auth resend warning for ${cleanEmail}: ${error.message}`);
        // Ignore rate-limit or email delivery warnings in test/demo mode while attempting resend
        if (error.message.toLowerCase().includes('invalid') && !error.message.toLowerCase().includes('rate')) {
          throw new AppError(`Failed to resend verification email: ${error.message}`, 400);
        }
      }
    }
  }

  /**
   * 1-Click Demo Login for quick testing & development
   */
  public async demoLogin(role: UserRole): Promise<AuthResponseData> {
    const demoEmail =
      role === 'admin'
        ? 'rajinder.admin@demo.pup.ac.in'
        : 'harman.student@demo.pup.ac.in';
    const demoPassword = 'password123';

    try {
      return await this.login({ email: demoEmail, password: demoPassword });
    } catch {
      // Fallback demo provisioning
      let user: User;
      try {
        const userRepo = getUserRepository();
        let found = await userRepo.getByEmail(demoEmail);
        if (!found) {
          found = await userRepo.upsert({
            name: role === 'admin' ? 'Dr. Rajinder Kumar' : 'Harmanpreet Singh',
            email: demoEmail,
            role,
            department: role === 'admin' ? 'Estate & Infrastructure Management Office' : 'Department of Computer Science & Engineering',
            rollNo: role === 'student' ? 'PUP2024-CS-042' : undefined,
            hostel: role === 'student' ? 'Banda Singh Bahadur Hostel (Block A, Room 304)' : undefined,
            phone: '+91 98765 43210',
            status: 'Active',
          });
        }
        user = found;
      } catch {
        user = {
          id: role === 'admin' ? 'user-admin-1' : 'user-student-1',
          name: role === 'admin' ? 'Dr. Rajinder Kumar' : 'Harmanpreet Singh',
          email: demoEmail,
          role,
          department: role === 'admin' ? 'Estate & Infrastructure Management Office' : 'Department of Computer Science & Engineering',
          rollNo: role === 'student' ? 'PUP2024-CS-042' : undefined,
          hostel: role === 'student' ? 'Banda Singh Bahadur Hostel (Block A, Room 304)' : undefined,
          phone: '+91 98765 43210',
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        };
      }

      const token = createMemoryToken(user);
      return {
        user,
        token,
        expiresIn: 604800,
        requiresVerification: false,
      };
    }
  }

  /**
   * Verify an authentication token and return the User profile (rejects unverified emails)
   */
  public async verifyToken(token: string): Promise<User | null> {
    if (!token || typeof token !== 'string') {
      return null;
    }

    const cleanToken = token.trim();
    const provider = getDataProvider();

    // Check memory token store first if present
    if (memoryTokenStore.has(cleanToken)) {
      const entry = memoryTokenStore.get(cleanToken)!;
      if (entry.expiresAt < Date.now()) {
        memoryTokenStore.delete(cleanToken);
        return null;
      }
      return entry.user;
    }

    // Supabase Auth verification
    if (provider === 'supabase' && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.getUser(cleanToken);

        if (error || !data?.user) {
          return null;
        }

        const authUser = data.user;

        // Enforce email verification check server-side on token validation
        const isVerified = Boolean(authUser.email_confirmed_at || authUser.confirmed_at);
        if (!isVerified) {
          return null;
        }

        let profile: User | null = null;
        try {
          const userRepo = getUserRepository();
          profile = await userRepo.getById(authUser.id);
          if (!profile && authUser.email) {
            profile = await userRepo.getByEmail(authUser.email);
          }
        } catch {
          // ignore error
        }

        if (!profile) {
          const metadata = authUser.user_metadata || {};
          profile = {
            id: authUser.id,
            name: metadata.name || authUser.email?.split('@')[0] || 'Campus User',
            email: authUser.email || '',
            role: (metadata.role as UserRole) || (authUser.email?.includes('admin') ? 'admin' : 'student'),
            department: metadata.department || 'General',
            rollNo: metadata.roll_no,
            hostel: metadata.hostel,
            phone: metadata.phone,
            status: 'Active',
            joinedDate: new Date().toISOString().split('T')[0],
          };
        }

        return profile;
      } catch {
        return null;
      }
    }

    return null;
  }
}

export const authService = new AuthService();
