import dotenv from 'dotenv';

dotenv.config();

export type DataProviderType = 'memory' | 'supabase';

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CORS_ORIGIN: string | string[];
  API_PREFIX: string;
  DATA_PROVIDER: DataProviderType;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  FRONTEND_URL: string;
  RESET_PASSWORD_REDIRECT_URL: string;
}

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase() as
  | 'development'
  | 'production'
  | 'test';

const defaultFrontendUrl =
  nodeEnv === 'production'
    ? 'https://pup-campus-care.vercel.app'
    : 'http://localhost:5173';

const frontendUrl = (process.env.FRONTEND_URL || defaultFrontendUrl).trim().replace(/\/$/, '');

const resetPasswordRedirectUrl = (
  process.env.RESET_PASSWORD_REDIRECT_URL ||
  `${frontendUrl}/#/reset-password`
).trim();

// Production safety guard:
// If the resolved FRONTEND_URL still points to localhost in a production environment,
// the server must refuse to start rather than silently sending broken password-reset emails.
if (nodeEnv === 'production') {
  const isLocalhostUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?($|\/)/.test(frontendUrl);
  if (isLocalhostUrl) {
    throw new Error(
      `[CampusCare] Production configuration error: FRONTEND_URL must be explicitly configured ` +
      `and must not point to localhost. ` +
      `Set FRONTEND_URL=https://pup-campus-care.vercel.app in the production environment. ` +
      `Current resolved value: "${frontendUrl}"`
    );
  }
}

const parseCorsOrigin = (rawOrigin?: string): any => {
  if (nodeEnv === 'development' || nodeEnv === 'test') {
    const customOrigins = rawOrigin
      ? rawOrigin.split(',').map((o) => o.trim())
      : [
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175',
          'http://127.0.0.1:5173',
          'http://127.0.0.1:5174',
          'http://127.0.0.1:5175',
        ];

    return (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow non-browser agents (CLI, Postman, test-api, etc.)
      if (!origin) return callback(null, true);
      if (
        customOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(null, false);
    };
  }

  if (!rawOrigin || rawOrigin === '*') return '*';
  if (rawOrigin.includes(',')) {
    return rawOrigin.split(',').map((o) => o.trim());
  }
  return rawOrigin.trim();
};

const rawProvider = (process.env.DATA_PROVIDER || 'memory').toLowerCase();
const initialDataProvider: DataProviderType =
  rawProvider === 'supabase' ? 'supabase' : 'memory';

export const config: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: nodeEnv,
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
  API_PREFIX: process.env.API_PREFIX || '/api/campuscare',
  DATA_PROVIDER: initialDataProvider,
  SUPABASE_URL: process.env.SUPABASE_URL?.trim() || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY?.trim() || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || '',
  FRONTEND_URL: frontendUrl,
  RESET_PASSWORD_REDIRECT_URL: resetPasswordRedirectUrl,
};

export const getDataProvider = (): DataProviderType => {
  const current = (process.env.DATA_PROVIDER || config.DATA_PROVIDER || 'memory').toLowerCase();
  return current === 'supabase' ? 'supabase' : 'memory';
};

export const getSupabaseKey = (): string => {
  return config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY || '';
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.SUPABASE_URL && getSupabaseKey());
};
