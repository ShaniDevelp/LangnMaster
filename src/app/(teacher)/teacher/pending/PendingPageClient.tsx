'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type ApplicationRow = {
  status: string
  submitted_at: string
  admin_notes: string | null
  languages_taught: { lang: string; proficiency: string }[] | null
  certifications: string[] | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function PendingPageClient({
  userId,
  initialApp,
}: {
  userId: string
  initialApp: ApplicationRow
}) {
  const [app, setApp] = useState<ApplicationRow>(initialApp)
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`teacher-application-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teacher_applications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as ApplicationRow
          setApp(updated)
          if (updated.status === 'approved') {
            setRedirecting(true)
            window.location.href = `/api/auth/set-teacher-state?next=/teacher/onboarding`
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const status = app.status as 'pending' | 'approved' | 'rejected'

  if (redirecting) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl bg-emerald-50 shadow-lg shadow-emerald-100">
            🎉
          </div>
          <h1 className="text-2xl font-bold text-gray-900">You&apos;re approved!</h1>
          <p className="text-gray-500">Redirecting to onboarding…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-24 items-start">

          {/* Left: status illustration + headline */}
          <div className="mb-10 lg:mb-0">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl text-4xl mb-6 shadow-lg ${
              status === 'rejected' ? 'bg-red-50 shadow-red-100' :
              status === 'approved' ? 'bg-emerald-50 shadow-emerald-100' :
              'bg-amber-50 shadow-amber-100'
            }`}>
              {status === 'rejected' ? '❌' : status === 'approved' ? '🎉' : '⏳'}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
              {status === 'rejected' && 'Application not approved'}
              {status === 'pending'  && 'Application under review'}
              {status === 'approved' && "You're approved!"}
            </h1>

            <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
              {status === 'rejected' && "Unfortunately your application wasn't approved at this time. You can reapply with updated information."}
              {status === 'pending'  && `Submitted ${formatDate(app.submitted_at)}. Our team reviews every application within 48 hours — we'll email you with our decision.`}
              {status === 'approved' && 'Your application has been approved. Complete your onboarding wizard to start teaching.'}
            </p>

            {status === 'rejected' && app.admin_notes && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 max-w-md">
                <p className="text-sm font-semibold text-red-800 mb-1.5">Feedback from our team</p>
                <p className="text-sm text-red-700">{app.admin_notes}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {status === 'rejected' && (
                <Link href="/teacher/application"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#6c4ff5] text-white font-bold text-base hover:bg-[#5c3de8] transition-colors shadow-lg shadow-purple-200">
                  Reapply now →
                </Link>
              )}
              {status === 'approved' && (
                <Link href="/teacher/onboarding"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#6c4ff5] text-white font-bold text-base hover:bg-[#5c3de8] transition-colors shadow-lg shadow-purple-200">
                  Complete onboarding →
                </Link>
              )}
              <a href="mailto:teachers@langmaster.com"
                className="inline-flex items-center justify-center px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-gray-300 hover:bg-gray-50 transition-colors">
                Contact us
              </a>
            </div>
          </div>

          {/* Right: context card */}
          <div className="space-y-5">
            {status === 'pending' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-800">Application status</p>
                  <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2.5 py-1 rounded-full">Under review</span>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Submitted</span>
                    <span className="font-medium text-gray-900">{formatDate(app.submitted_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expected decision</span>
                    <span className="font-medium text-gray-900">Within 48 hours</span>
                  </div>
                  {app.languages_taught && app.languages_taught.length > 0 && (
                    <div className="flex items-start justify-between text-sm gap-4">
                      <span className="text-gray-500 flex-shrink-0">Languages</span>
                      <span className="font-medium text-gray-900 text-right">
                        {app.languages_taught.map(l => l.lang).join(', ')}
                      </span>
                    </div>
                  )}
                  {app.certifications && app.certifications.length > 0 && (
                    <div className="flex items-start justify-between text-sm gap-4">
                      <span className="text-gray-500 flex-shrink-0">Certifications</span>
                      <span className="font-medium text-gray-900 text-right">
                        {app.certifications.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === 'rejected' && app.admin_notes && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <p className="text-sm font-semibold text-red-800 mb-1.5">Feedback from our team</p>
                <p className="text-sm text-red-700">{app.admin_notes}</p>
              </div>
            )}

            {/* Journey steps */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your journey</p>
              <ol className="space-y-5">
                {[
                  {
                    step: '1', title: 'Application submitted',
                    desc: `Submitted ${formatDate(app.submitted_at)}`,
                    done: true,
                    active: false,
                  },
                  {
                    step: '2', title: 'Under review',
                    desc: 'We check your experience and availability.',
                    done: status === 'approved',
                    active: status === 'pending',
                  },
                  {
                    step: '3', title: 'Onboarding wizard',
                    desc: 'Set your schedule, preferences & test your device.',
                    done: false,
                    active: status === 'approved',
                  },
                  {
                    step: '4', title: 'Start teaching',
                    desc: 'Admin assigns your first group. Session starts Monday.',
                    done: false,
                    active: false,
                  },
                ].map(item => (
                  <li key={item.step} className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                      item.done   ? 'bg-emerald-100 text-emerald-600' :
                      item.active ? 'bg-[#6c4ff5] text-white' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {item.done ? '✓' : item.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${item.active ? 'text-[#6c4ff5]' : item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {item.title}
                        </p>
                        {item.active && (
                          <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5 flex items-start gap-4">
              <span className="text-2xl">💬</span>
              <div>
                <p className="text-sm font-semibold text-purple-900">Need help?</p>
                <p className="text-sm text-purple-700 mt-0.5">
                  Email us at{' '}
                  <a href="mailto:teachers@langmaster.com" className="font-semibold underline hover:text-purple-900">
                    teachers@langmaster.com
                  </a>
                  {' '}— we usually respond within a few hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
