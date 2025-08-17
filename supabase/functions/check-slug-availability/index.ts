import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CheckSlugRequest {
  slug: string
}

interface CheckSlugResponse {
  available: boolean
  suggestedSlug?: string
}

Deno.serve(async (req: Request) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 200,
        headers: corsHeaders 
      })
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

    const { slug }: CheckSlugRequest = await req.json()

    if (!slug || typeof slug !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid slug is required' }),
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

    // Check if slug exists
    const { data: existingStore, error } = await supabase
      .from('store_profiles')
      .select('store_slug')
      .eq('store_slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const available = !existingStore

    let response: CheckSlugResponse = { available }

    // If not available, suggest an alternative
    if (!available) {
      // Get all slugs that start with the base slug
      const { data: similarSlugs } = await supabase
        .from('store_profiles')
        .select('store_slug')
        .like('store_slug', `${slug}%`)

      const existingSlugs = similarSlugs?.map(s => s.store_slug) || []
      
      // Generate a unique slug
      let counter = 2
      let suggestedSlug = `${slug}${counter}`
      
      while (existingSlugs.includes(suggestedSlug)) {
        counter++
        suggestedSlug = `${slug}${counter}`
      }

      response.suggestedSlug = suggestedSlug
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