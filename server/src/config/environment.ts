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
}

const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase() as
  | 'development'
  | 'production'
  | 'test';

const parseCorsOrigin = (rawOrigin?: string): string | string[] => {
  if (!rawOrigin) {
    return nodeEnv === 'production' ? 'http://localhost:5173' : '*';
  }
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
