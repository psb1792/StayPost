import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with automatic token handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'staypost-web'
    }
  }
})

// Storage bucket name for images
export const IMAGES_BUCKET = 'processed-images'

// Database table for image records
export const IMAGES_TABLE = 'processed_images'

// Helper function to invoke Supabase Edge Functions with automatic token handling
export async function invokeSupabaseFunction<T = any>(
  path: string, 
  init?: { method?: 'GET'|'POST'; body?: any }
): Promise<{ data: T | null; error: any }> {
  const method = init?.method ?? 'POST';
  if (method !== 'GET' && init?.body == null) {
    throw new Error(`BODY_MISSING for ${path}`);    // ✅ 프런트에서 즉시 차단
  }
  
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${path.replace(/^\//,'')}`;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(url, {
    method: init?.method ?? 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session?.access_token ?? anon}`,
      "apikey": anon,
      "x-client-info": "staypost-web",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    // 👇 서버 메시지를 그대로 노출 (422/500 구분 포함)
    throw new Error(`EdgeFn ${path} ${res.status}: ${text}`);
  }
  return { data: JSON.parse(text) as T, error: null };
}