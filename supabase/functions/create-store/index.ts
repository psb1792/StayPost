import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateStoreRequest {
  storeName: string
  slug: string
}

interface CreateStoreResponse {
  success: boolean
  store?: {
    id: string
    store_name: string
    slug: string
    created_at: string
  }
  error?: string
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { storeName, slug }: CreateStoreRequest = await req.json()

    if (!storeName || !slug || typeof storeName !== 'string' || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid store name and slug are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate that slug is ASCII-only and follows proper format
    const asciiSlug = slug.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9-]/g, '') // Only allow lowercase letters, numbers, and hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen

    if (asciiSlug !== slug) {
      return new Response(
        JSON.stringify({ error: 'Slug must be ASCII-only and follow proper format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Double-check slug availability and create store
    const { data: newStore, error } = await supabase
      .from('store_profiles')
      .insert({
        store_name: storeName,
        store_slug: asciiSlug
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      
      if (error.code === '23505') { // Unique constraint violation
        return new Response(
          JSON.stringify({ error: 'Slug is already taken. Please try a different one.' }),
          { 
            status: 409, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to create store' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const response: CreateStoreResponse = {
      success: true,
      store: newStore
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})