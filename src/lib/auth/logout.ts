// Cookie deletion only works in Server Actions / Route Handlers, NOT in layouts.
// Layouts must use plain redirect() — Supabase SSR clears session cookies automatically
// when getSession() fails a refresh, so the proxy won't bounce back.
export { redirect as clearSessionAndRedirect } from 'next/navigation'
