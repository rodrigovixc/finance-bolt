import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Testar a conexão
supabase.auth.getSession().then(({ data: { session } }) => {
  // Sessão obtida com sucesso
}).catch(error => {
  console.error('Erro ao obter sessão:', error)
}) 