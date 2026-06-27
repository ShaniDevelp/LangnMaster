'use client'
import { useState, useTransition } from 'react'
import { signInWithGoogle } from '@/lib/auth/actions'

/**
 * Starts the Google OAuth flow. The server action returns a redirect to Google;
 * on error it returns a message we surface inline.
 */
export function GoogleButton({
  label = 'Continue with Google',
  role,
}: {
  label?: string
  /** Role to assign if this Google sign-in creates a new account. */
  role?: 'student' | 'teacher'
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function go() {
    setError(null)
    startTransition(async () => {
      const res = await signInWithGoogle(role)
      if (res?.error) setError(res.error)
      // success → server action redirects to Google
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={go}
        disabled={isPending}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 1 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44c11 0 20-9 20-20 0-1.3-.1-2.3-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.6 5.1A20 20 0 0 0 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.9 36.3 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z"/>
        </svg>
        {isPending ? 'Redirecting…' : label}
      </button>
      {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
    </div>
  )
}

/** Horizontal divider with centered label, for separating Google from the form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
