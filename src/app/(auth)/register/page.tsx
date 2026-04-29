'use client'
import { Suspense, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signUp } from '@/lib/auth/actions'

function RegisterForm() {
  const params = useSearchParams()
  const [role, setRole] = useState<'student' | 'teacher'>((params.get('role') as 'student' | 'teacher') || 'student')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set('role', role)
    startTransition(async () => {
      const result = await signUp(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
      <p className="text-gray-500 text-sm mb-6">Join LangMaster and start your language journey</p>

      {/* Role Toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 gap-1">
        <button
          type="button"
          onClick={() => setRole('student')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            role === 'student' ? 'bg-white text-[#6c4ff5] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎓 Student
        </button>
        <button
          type="button"
          onClick={() => setRole('teacher')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            role === 'teacher' ? 'bg-white text-[#6c4ff5] shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          👨‍🏫 Teacher
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
          <input
            id="name" name="name" type="text" required autoComplete="name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            id="email" name="email" type="email" required autoComplete="email"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            id="password" name="password" type="password" required autoComplete="new-password" minLength={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
            placeholder="Min. 6 characters"
          />
        </div>

        {role === 'teacher' && (
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">Short bio</label>
            <textarea
              id="bio" name="bio" rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition resize-none"
              placeholder="e.g. Native English speaker with 5 years teaching experience…"
            />
          </div>
        )}

        <div className="bg-purple-50 rounded-xl p-3 text-xs text-purple-700">
          {role === 'student'
            ? '🎓 You will be grouped with 1 other student and assigned a teacher. Sessions start next Monday.'
            : '👨‍🏫 You will be assigned groups of 2 students each week. Sessions are 3x per week.'}
        </div>

        <button
          type="submit" disabled={isPending}
          className="w-full bg-[#6c4ff5] text-white font-semibold py-3.5 rounded-xl hover:bg-[#5c3de8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? 'Creating account…' : `Join as ${role === 'student' ? 'Student' : 'Teacher'}`}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#6c4ff5] hover:text-[#5c3de8]">
          Sign in
        </Link>
      </p>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-2xl font-bold text-[#6c4ff5]">LangMaster</span>
        </Link>
        <Suspense fallback={<div className="bg-white rounded-3xl shadow-xl shadow-purple-100 border border-gray-100 p-8 text-center text-gray-400">Loading…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
