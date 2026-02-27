import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check for Supabase auth token in cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Supabase stores the session in cookies with project-ref based names
  // We look for the access token cookie
  const allCookies = request.cookies.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))

  if (!authCookie) {
    // No auth cookie - check if there's a session by trying to parse sb-* cookies
    const sbCookies = allCookies.filter(c => c.name.startsWith('sb-'))
    if (sbCookies.length === 0) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Verify the session with Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        cookie: allCookies.map(c => `${c.name}=${c.value}`).join('; '),
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
