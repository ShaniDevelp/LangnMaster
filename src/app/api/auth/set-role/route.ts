import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Called by proxy when authenticated user has no x-user-role cookie.
// Reads role from DB and sets the cookie, then redirects to intended destination.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  const role = (data as { role: string } | null)?.role ?? 'student'

  const response = NextResponse.redirect(new URL(next, request.url))
  response.cookies.set('x-user-role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
