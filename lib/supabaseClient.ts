import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side helper for middleware
export function createSupabaseServer(cookies: { name: string; value: string }[]) {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: cookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    },
  })
  return client
}
