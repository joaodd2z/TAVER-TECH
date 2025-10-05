import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.DB_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.DB_ANON_KEY;
  if (!url || !key) return null;
  if (supabase) return supabase;
  // Lazy client creation avoids crashes when envs are missing
  supabase = createClient(url, key);
  return supabase;
}

export const HAS_SUPABASE =
  Boolean(process.env.SUPABASE_URL || process.env.DB_URL) &&
  Boolean(process.env.SUPABASE_ANON_KEY || process.env.DB_ANON_KEY);