import { config, getDataProvider, isSupabaseConfigured } from '../config/environment.js';
import { getSupabaseClient } from '../database/supabaseClient.js';
import { getUserRepository } from '../repositories/index.js';
import { User, UserRole, Gender, AuthResponseData } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  rollNo?: string;
  gender?: Gender;
  department?: string;
  hostel?: string;
  phone?: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  token?: string;
  password: string;
}

// Memory mode token store (isolated fallback for testing & non-database local run)
const memoryTokenStore = new Map<string, { user: User; expiresAt: number }>();
const memoryResetTokenStore = new Map<string, { email: string; expiresAt: number }>();
const memoryPasswordStore = new Map<string, string>();

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
   * Register a new student account — account is created and session issued immediately.
   * Email verification is NOT required.
   * SECURITY: Server-side registration strictly forces role = 'student'.
   */
  public async register(input: RegisterInput): Promise<AuthResponseData> {
    const provider = getDataProvider();
    // Strictly force student role for public registrations — prevent privilege escalation
    const role: UserRole = 'student';
    const email = input.email.trim().toLowerCase();

    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();

      // Use admin API with email_confirm:true so the account is immediately usable
      // without requiring the user to click a verification link.
      const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
        email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          name: input.name,
          role,
          gender: input.gender || null,
          roll_no: input.rollNo || null,
          department: input.department || 'General',
          hostel: input.hostel || null,
          phone: input.phone || null,
        },
      });

      if (adminError) {
        const msg = adminError.message.toLowerCase();
        if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('email address is already')) {
          throw new AppError('An account with this email already exists. Please sign in instead.', 409);
        }
        if (msg.includes('rate limit') || adminError.status === 429) {
          throw new AppError('Too many requests. Please wait a few minutes before trying again.', 429);
        }
        throw new AppError(`Registration failed: ${adminError.message}`, 400);
      }

      const authUserId = adminData.user?.id || null;

      // Sync profile to public.users table
      let userProfile: User;
      try {
        const userRepo = getUserRepository();
        userProfile = await userRepo.upsert({
          id: authUserId || undefined,
          name: input.name,
          email,
          role,
          gender: input.gender,
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
          gender: input.gender,
          rollNo: input.rollNo,
          department: input.department || 'General',
          hostel: input.hostel,
          phone: input.phone,
          status: 'Active',
          joinedDate: new Date().toISOString().split('T')[0],
        };
      }

      // Immediately sign the user in to get a live session token
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: input.password,
      });

      if (signInError || !signInData?.session) {
        // Account was created but we couldn't produce a session — return partial success.
        // The user can log in normally.
        return {
          user: userProfile,
        };
      }

      return {
        user: userProfile,
        token: signInData.session.access_token,
        refreshToken: signInData.session.refresh_token,
        expiresIn: signInData.session.expires_in,
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
      gender: input.gender,
      rollNo: input.rollNo,
      department: input.department || 'Computer Science & Engineering',
      hostel: input.hostel,
      phone: input.phone,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
    });

    // Issue a token immediately — no verification gate in memory mode either
    memoryPasswordStore.set(email, input.password);
    const token = createMemoryToken(newUser);
    return {
      user: newUser,
      token,
      expiresIn: 604800,
    };
  }

  /**
   * Authenticate user with email and password.
   * Email verification is NOT enforced — any valid account can log in immediately.
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
      };
    }

    // Memory provider fallback for testing
    const userRepo = getUserRepository();
    const user = await userRepo.getByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const storedPassword = memoryPasswordStore.get(email) || 'password123';
    if (input.password !== storedPassword) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = createMemoryToken(user);
    return {
      user,
      token,
      expiresIn: 604800,
    };
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
      };
    }
  }

  /**
   * Request password recovery link for email.
   * Generic response prevents account enumeration.
   */
  public async forgotPassword(email: string): Promise<{ sent: boolean }> {
    const cleanEmail = email.trim().toLowerCase();
    const provider = getDataProvider();

    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const redirectUrl = config.RESET_PASSWORD_REDIRECT_URL;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl,
        });

        if (error) {
          // Log the provider error for server-side observability but do NOT surface it to the client.
          // The forgot-password endpoint must always return the generic recovery response to:
          //   1. Prevent account enumeration (don't reveal whether the email exists).
          //   2. Prevent leaking provider/rate-limit details through the public API.
          console.error(`[AuthService] Supabase resetPasswordForEmail error (${error.status || 'unknown'}):`, error.message);
        }
      } catch (err) {
        // Unexpected network/SDK errors — log and continue. Never propagate to the caller.
        console.error('[AuthService] Unexpected error during forgotPassword:', err);
      }
    } else {
      // Memory store fallback for test/offline
      const resetToken = `cc_reset_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      memoryResetTokenStore.set(resetToken, {
        email: cleanEmail,
        expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
      });
    }

    return { sent: true };
  }

  /**
   * Reset user password using verified session or recovery token.
   * SECURITY: Updates ONLY the password. Never alters role, studentId, or permissions.
   */
  public async resetPassword(input: ResetPasswordInput): Promise<{ updated: boolean }> {
    const { token, password } = input;

    if (!token || typeof token !== 'string') {
      throw new AppError('A valid recovery token or session is required to reset password.', 401);
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new AppError('Password must be at least 6 characters.', 400);
    }

    const cleanToken = token.trim();
    const provider = getDataProvider();

    // Check memory token stores first (isolated fallback / test tokens)
    if (memoryResetTokenStore.has(cleanToken)) {
      const entry = memoryResetTokenStore.get(cleanToken)!;
      if (entry.expiresAt < Date.now()) {
        memoryResetTokenStore.delete(cleanToken);
        throw new AppError('Password reset link has expired. Please request a new one.', 401);
      }
      memoryResetTokenStore.delete(cleanToken);
      memoryPasswordStore.set(entry.email, password);
      return { updated: true };
    }

    if (memoryTokenStore.has(cleanToken)) {
      const entry = memoryTokenStore.get(cleanToken)!;
      if (entry.expiresAt < Date.now()) {
        memoryTokenStore.delete(cleanToken);
        throw new AppError('Session has expired.', 401);
      }
      memoryPasswordStore.set(entry.user.email, password);
      return { updated: true };
    }

    // Supabase Auth verification & password reset
    if (provider === 'supabase' && isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(cleanToken);

      if (error || !data?.user) {
        throw new AppError('Invalid or expired password reset link. Please request a new one.', 401);
      }

      const userId = data.user.id;

      // Update ONLY password via Supabase Admin API to guarantee role/metadata immutability
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
      });

      if (updateError) {
        throw new AppError(`Failed to update password: ${updateError.message}`, 400);
      }

      return { updated: true };
    }

    throw new AppError('Invalid or expired password reset token.', 401);
  }

  /**
   * Verify an authentication token and return the User profile.
   * Email verification status is NOT checked — any valid session token is accepted.
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
            gender: (metadata.gender as Gender) || undefined,
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
