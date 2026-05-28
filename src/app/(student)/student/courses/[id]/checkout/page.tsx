'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { enrollWithoutPayment, createCheckoutSession } from '@/lib/student/actions'

const LANG_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  English:  { emoji: '🇬🇧', gradient: 'from-blue-500 to-indigo-600' },
  Spanish:  { emoji: '🇪🇸', gradient: 'from-red-500 to-orange-500' },
  French:   { emoji: '🇫🇷', gradient: 'from-blue-600 to-blue-800' },
  German:   { emoji: '🇩🇪', gradient: 'from-yellow-500 to-amber-600' },
  Mandarin: { emoji: '🇨🇳', gradient: 'from-red-600 to-red-800' },
}

type Course = {
  id: string
  name: string
  language: string
  level: string
  duration_weeks: number
  sessions_per_week: number
  max_group_size: number
  price_usd: number
  description: string
}

type Enrollment = { status: string; payment_status: string } | null

function nextCohortDate(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntil = day === 1 ? 7 : day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntil)
  return monday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment>(null)
  const [loading, setLoading] = useState(true)
  const [isPendingEnroll, startEnrollTransition] = useTransition()
  const [isPendingPay, startPayTransition] = useTransition()
  const [enrollError, setEnrollError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/student/course-checkout-data?id=${id}`)
        if (!res.ok) { router.push('/student/courses'); return }
        const data = await res.json()
        setCourse(data.course)
        setEnrollment(data.enrollment)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  function handleEnroll() {
    setEnrollError(null)
    startEnrollTransition(async () => {
      const result = await enrollWithoutPayment(id)
      if (result && 'error' in result) setEnrollError(result.error)
    })
  }

  function handlePayNow() {
    startPayTransition(async () => {
      await createCheckoutSession(id)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    )
  }

  if (!course) return null

  const cfg = LANG_CONFIG[course.language] ?? { emoji: '🌍', gradient: 'from-gray-400 to-gray-600' }
  const cohortDate = nextCohortDate()
  const alreadyPaid = enrollment?.payment_status === 'paid'
  const enrolledUnpaidAssigned = enrollment?.payment_status === 'unpaid' && enrollment?.status === 'assigned'
  const enrolledUnpaidPending = enrollment?.payment_status === 'unpaid' && enrollment?.status === 'pending'

  // Already paid
  if (alreadyPaid) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-bold text-green-800 mb-2">You&apos;re enrolled and paid!</h2>
          <p className="text-green-700 text-sm mb-5">Check your dashboard for group and session updates.</p>
          <Link href="/student/dashboard" className="inline-flex bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors">
            Go to dashboard →
          </Link>
        </div>
      </div>
    )
  }

  // Enrolled, unpaid, group already assigned → prompt to pay
  if (enrolledUnpaidAssigned) {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div className="mb-5">
          <Link href={`/student/courses/${id}`} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← Back to course
          </Link>
        </div>
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Your group has been assigned!</h2>
          <p className="text-amber-800 text-sm mb-1">Pay now to unlock your live sessions and get started.</p>
          <p className="text-3xl font-extrabold text-gray-900 my-4">${course.price_usd} <span className="text-base font-normal text-gray-500">USD</span></p>
          <button
            type="button"
            onClick={handlePayNow}
            disabled={isPendingPay}
            className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPendingPay ? (
              <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Redirecting…</>
            ) : (
              <>🔒 Pay ${course.price_usd} to unlock sessions</>
            )}
          </button>
          <div className="mt-4 text-xs text-amber-700 space-y-1">
            <div>🔒 Secure payment via Stripe · 7-day refund guarantee</div>
          </div>
        </div>
      </div>
    )
  }

  // Enrolled, unpaid, still pending (awaiting group)
  if (enrolledUnpaidPending) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="mb-5">
          <Link href={`/student/courses/${id}`} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
            ← Back to course
          </Link>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 text-center">
          <div className="text-4xl mb-3">⏳</div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">You&apos;re enrolled!</h2>
          <p className="text-blue-700 text-sm mb-5">
            Awaiting group assignment. You&apos;ll be prompted to pay once your group is assigned.
          </p>
          <Link href="/student/dashboard" className="inline-flex bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors">
            Go to dashboard →
          </Link>
        </div>
      </div>
    )
  }

  // Not enrolled yet — main enrollment flow
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-5">
        <Link href={`/student/courses/${id}`} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
          ← Back to course
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirm your enrollment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* ── Left: course summary ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden">
            <div className={`h-24 bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-5xl`}>
              {cfg.emoji}
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{course.name}</h2>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full capitalize flex-shrink-0">
                  {course.level}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{course.description}</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '📅', label: 'Sessions', val: `${course.sessions_per_week}× per week` },
                  { icon: '🗓', label: 'Duration', val: `${course.duration_weeks} weeks` },
                  { icon: '👥', label: 'Group size', val: `${course.max_group_size} students` },
                  { icon: '📆', label: 'Cohort starts', val: cohortDate },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
            <h3 className="font-bold text-gray-900 mb-4">What&apos;s included</h3>
            <ul className="space-y-3">
              {[
                `${course.sessions_per_week * course.duration_weeks} live video sessions`,
                'Group of 2 — max speaking time every class',
                'One dedicated teacher for the full course',
                'Weekly curriculum + homework materials',
                'Session recordings (Pro & Intensive tiers)',
                'Completion certificate',
                '7-day money-back guarantee',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-3xl p-6">
            <h3 className="font-bold text-purple-900 mb-3">How enrollment works</h3>
            <ol className="space-y-2 text-sm text-purple-700">
              <li className="flex gap-3"><span className="font-bold flex-shrink-0">1.</span>Enroll today — free, no payment required</li>
              <li className="flex gap-3"><span className="font-bold flex-shrink-0">2.</span>Matched with a partner at your level and timezone</li>
              <li className="flex gap-3"><span className="font-bold flex-shrink-0">3.</span>Once your group is assigned, pay to unlock sessions</li>
              <li className="flex gap-3"><span className="font-bold flex-shrink-0">4.</span>Live sessions begin with your teacher and partner</li>
            </ol>
          </div>
        </div>

        {/* ── Right: price summary + enroll ── */}
        <div>
          <div className="sticky top-8 bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-5">
            <h3 className="font-bold text-gray-900 text-lg">Course price</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{course.name}</span>
                <span>${course.price_usd}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{course.sessions_per_week * course.duration_weeks} sessions × 60 min</span>
                <span className="text-xs">included</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>${course.price_usd} USD</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-sm text-green-800">
              <p className="font-semibold mb-0.5">🔓 Pay after group assignment</p>
              <p className="text-xs text-green-700">Enroll for free now. You&apos;ll only be charged once your study group is assigned.</p>
            </div>

            {enrollError && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {enrollError}
              </div>
            )}

            <button
              type="button"
              onClick={handleEnroll}
              disabled={isPendingEnroll}
              className="w-full bg-brand-500 text-white font-bold py-4 rounded-2xl text-base hover:bg-brand-600 transition-colors shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPendingEnroll ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Enrolling…
                </>
              ) : (
                <>Enroll now — pay after group is assigned</>
              )}
            </button>

            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2"><span>💳</span> Payment due only after group assignment</div>
              <div className="flex items-center gap-2"><span>↩️</span> 7-day full refund if you change your mind</div>
              <div className="flex items-center gap-2"><span>🔒</span> Payment via Stripe — secure checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
