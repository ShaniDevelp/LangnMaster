import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { fulfillCheckoutSession } from '@/lib/student/actions'

// Must be raw body — disable Next.js body parsing
export const config = { api: { bodyParser: false } }

export async function POST(request: Request) {
  const body = await request.text()
  const h = await headers()
  const sig = h.get('stripe-signature')

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await fulfillCheckoutSession(session.id)
  }

  return new Response('ok', { status: 200 })
}
