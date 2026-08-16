import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  CORS_ORIGIN: string | string[];
  API_PREFIX: string;
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

export const config: EnvironmentConfig = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: nodeEnv,
  CORS_ORIGIN: parseCorsOrigin(process.env.CORS_ORIGIN),
  API_PREFIX: process.env.API_PREFIX || '/api/campuscare',
};
