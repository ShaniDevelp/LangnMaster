import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function roleDashboard(role: string) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'teacher') return '/teacher/dashboard'
  return '/student/dashboard'
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getSession() only to check if a session exists (null = unauthenticated).
  // We do NOT use session.user for security decisions — that's done in layouts via getUser().
  // Role comes from x-user-role cookie set by signIn/signUp (accurate, includes SQL-promoted admins).
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = session !== null
  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/login', '/register', '/admin/login']
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith('/api')

  if (!isAuthenticated) {
    if (!isPublic) {
      const loginPage = pathname.startsWith('/admin') ? '/admin/login' : '/login'
      return NextResponse.redirect(new URL(loginPage, request.url))
    }
    return supabaseResponse
  }

  const roleCookie = request.cookies.get('x-user-role')?.value

  // If authenticated but no role cookie (e.g. session predates this deploy),
  // fetch role from DB once via the set-role endpoint and come back.
  if (!roleCookie && !pathname.startsWith('/api/auth/set-role')) {
    const setRoleUrl = new URL('/api/auth/set-role', request.url)
    setRoleUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(setRoleUrl)
  }

  const role: string = roleCookie || 'student'

  // Redirect authenticated users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url))
  }

  if (pathname === '/admin/login') {
    // Only redirect away if we're confident the user is admin (cookie present)
    if (role === 'admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    // No role cookie or non-admin: let them attempt admin login (they'll get rejected by signInAdmin)
    return supabaseResponse
  }

  // Role-based route guards
  if (pathname.startsWith('/student') && role !== 'student') {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url))
  }

  // ── Teacher route guard ────────────────────────────────────────────────────
  if (pathname.startsWith('/teacher')) {
    if (role !== 'teacher') {
      return NextResponse.redirect(new URL(roleDashboard(role), request.url))
    }

    // Free-pass routes — accessible regardless of approval / onboarding state
    const freeRoutes = ['/teacher/application', '/teacher/pending']
    if (freeRoutes.some(r => pathname.startsWith(r))) {
      return supabaseResponse
    }

    const isApproved = request.cookies.get('x-teacher-approved')?.value === 'true'
    const isOnboarded = request.cookies.get('x-teacher-onboarded')?.value === 'true'

    // If neither cookie is set, fetch state from DB once (same pattern as set-role)
    if (!isApproved && !isOnboarded && !pathname.startsWith('/api/auth/set-teacher-state')) {
      const stateUrl = new URL('/api/auth/set-teacher-state', request.url)
      stateUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(stateUrl)
    }

    // Not approved yet → hold at pending
    if (!isApproved) {
      return NextResponse.redirect(new URL('/teacher/pending', request.url))
    }

    // Approved but hasn't completed onboarding wizard
    if (!isOnboarded && !pathname.startsWith('/teacher/onboarding')) {
      return NextResponse.redirect(new URL('/teacher/onboarding', request.url))
    }

    return supabaseResponse
  }

  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(roleDashboard(role), request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
