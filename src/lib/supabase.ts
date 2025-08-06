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
  functionName: string, 
  body?: any
): Promise<{ data: T | null; error: any }> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
    })
    
    return { data, error }
  } catch (err) {
    console.error(`Error invoking ${functionName}:`, err)
    return { data: null, error: err }
  }
}