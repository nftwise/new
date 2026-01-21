import { createClient } from '@supabase/supabase-js'
import { env } from '../env'

// Use validated environment variables
// During build time, these may be empty - use placeholders to prevent build errors
// They'll be properly initialized at runtime when Vercel injects env vars
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Client for browser/frontend use (Row Level Security applies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Service client for server-side use (bypasses RLS - use carefully!)
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
