/**
 * Centralized Supabase Client for Seekora AI
 *
 * Exclusively uses public client credentials:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 *
 * Safe across both Vite client (import.meta.env) and Node/SSR (process.env).
 * Never hard-codes credentials. Never exposes or imports the service-role key.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Universal environment variable lookup
const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return String(import.meta.env[name]).trim();
    }
  } catch {
    // Ignore and fallback
  }

  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return String(process.env[name]).trim();
    }
  } catch {
    // Ignore and fallback
  }

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
);

export const supabaseConfigError: string | null = isSupabaseConfigured
  ? null
  : 'Supabase configuration is missing. Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY';

// Fallback dummy URL so createClient does not throw an immediate fatal error if unconfigured
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
