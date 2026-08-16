import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config, getSupabaseKey, isSupabaseConfigured } from '../config/environment.js';

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (clientInstance) {
    return clientInstance;
  }

  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Please provide SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in server/.env'
    );
  }

  const supabaseUrl = config.SUPABASE_URL;
  const supabaseKey = getSupabaseKey();

  clientInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return clientInstance;
};
