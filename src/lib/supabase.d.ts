declare module '@supabase/supabase-js' {
  export * from '@supabase/supabase-js'
}

declare module '../lib/supabaseClient' {
  import { SupabaseClient } from '@supabase/supabase-js'
  export const supabase: SupabaseClient
} 
 
 
 