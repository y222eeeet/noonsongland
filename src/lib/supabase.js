import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// This only initializes the Supabase client. It does not create, query, or modify tables.
export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export const isSupabaseConfigured = Boolean(supabase)

export async function ensureAnonymousSession() {
  if (!supabase) {
    return { data: { session: null }, error: new Error('Supabase 설정을 찾지 못했어요.') }
  }

  const current = await supabase.auth.getSession()
  if (current.error || current.data.session) return current

  return supabase.auth.signInAnonymously()
}
