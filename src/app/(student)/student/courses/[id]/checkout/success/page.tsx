import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/student/actions'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function nextMondayLabel(): string {
  const today = new Date()
  const day = today.getDay()
  const daysUntil = day === 1 ? 7 : day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntil)
  return monday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

type SearchParams = Promise<{ session_id?: string }>

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/student/courses')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Retrieve session from Stripe to confirm payment and get metadata
  let courseName = 'your course'
  let amount = ''
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)

    // Fulfillment is handled by webhook, but call here as backup
    // (handles case where webhook hasn't fired yet)
    if (session.payment_status === 'paid') {
      await fulfillCheckoutSession(session_id)
      const lineItem = session.amount_total
      if (lineItem) amount = `$${(lineItem / 100).toFixed(2)}`
    }

    // Get course name from DB via metadata
    const courseId = session.metadata?.course_id
    if (courseId) {
      const { data } = await supabase.from('courses').select('name').eq('id', courseId).single()
      if (data) courseName = (data as { name: string }).name
    }
  } catch {
    // Stripe retrieval failed — enrollment created by webhook, show generic success
  }

  const monday = nextMondayLabel()

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Success card */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-5">
          🎉
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment successful!</h1>
        {amount && (
          <p className="text-gray-500 text-sm mb-1">
            {amount} received · receipt sent to your email.
          </p>
        )}
        <p className="text-gray-600 text-sm mb-6">
          You&apos;re enrolled in <span className="font-semibold text-gray-900">{courseName}</span>.
        </p>

        {/* What happens next */}
        <div className="bg-purple-50 rounded-2xl p-5 text-left mb-6">
          <h2 className="font-bold text-purple-900 text-sm mb-3">What happens next</h2>
          <ol className="space-y-3">
            {[
              { icon: '⏳', label: 'Group forming', note: `Your partner and teacher are matched by ${monday}.` },
              { icon: '📧', label: 'Email notification', note: 'We email you when your group is confirmed.' },
              { icon: '🗓', label: 'Schedule agreed', note: 'Your group picks session times together before week one.' },
              { icon: '🎥', label: 'Live sessions start', note: 'Join your first session from the dashboard.' },
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-white border border-purple-200 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-900">{step.label}</p>
                  <p className="text-xs text-purple-700 mt-0.5">{step.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/student/dashboard"
            className="flex-1 bg-brand-500 text-white font-bold py-3.5 rounded-xl hover:bg-brand-600 transition-colors text-sm"
          >
            Go to dashboard →
          </Link>
          <Link
            href="/student/courses"
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Browse more courses
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Questions? Email us at support@langmaster.com
      </p>
    </div>
  )
}
