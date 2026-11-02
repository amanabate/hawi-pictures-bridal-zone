import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseServerConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);

let serverClientInstance: SupabaseClient | null = null;

/**
 * Returns a server-side Supabase client with Service Role privileges.
 * This client bypasses RLS for atomic operations, server-validated booking creations,
 * signed storage URL generation, and background cron jobs.
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!isSupabaseServerConfigured) {
    return null;
  }
  if (!serverClientInstance) {
    serverClientInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return serverClientInstance;
}

/**
 * Generates a short-lived signed URL (default 15 minutes) for a private payment screenshot.
 */
export async function createSignedScreenshotUrl(
  path: string,
  expiresInSeconds: number = 900
): Promise<string | null> {
  const client = getSupabaseServerClient();
  if (!client) {
    // If running in development without live Supabase storage, return local path or placeholder
    return path;
  }

  try {
    const { data, error } = await client.storage
      .from('payment-screenshots')
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      console.error('[Supabase Storage] createSignedUrl error:', error);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error('[Supabase Storage] signed url exception:', err);
    return null;
  }
}
