import 'server-only'
import { createHash, randomInt } from 'crypto'
import { createAdminClient } from '@/lib/supabase/server'
import { sendVerificationCodeEmail } from '@/lib/email'

export type OtpType = 'signup' | 'recovery'

export const CODE_LENGTH = 6
export const CODE_TTL_MS = 10 * 60 * 1000 // 10 minutes
export const RESEND_COOLDOWN_MS = 60 * 1000 // 60 seconds
export const MAX_ATTEMPTS = 5

const TABLE = 'email_verification_codes'

/** Mirror these to the verify UI so it can show countdowns without a round-trip. */
export const OTP_TTL_SECONDS = CODE_TTL_MS / 1000
export const OTP_RESEND_SECONDS = RESEND_COOLDOWN_MS / 1000

function hashCode(code: string, email: string): string {
  const pepper = process.env.ADMIN_SECRET ?? ''
  return createHash('sha256').update(`${code}:${email.toLowerCase()}:${pepper}`).digest('hex')
}

function randomCode(): string {
  // 6 digits, zero-padded. randomInt is cryptographically secure.
  return randomInt(0, 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0')
}

type Row = {
  email: string
  user_id: string | null
  type: OtpType
  code_hash: string
  expires_at: string
  consumed_at: string | null
  attempts: number
  last_sent_at: string
}

/**
 * Generates a fresh code, stores its hash (overwriting any prior code for this
 * email+type), and emails it via Resend. Enforces a resend cooldown so the
 * endpoint can't be hammered. Returns a cooldown hint when called too soon.
 */
export async function generateAndSendCode(args: {
  email: string
  userId: string | null
  type: OtpType
}): Promise<{ ok: true } | { ok: false; error: string; cooldownSeconds?: number }> {
  const email = args.email.toLowerCase()
  const admin = createAdminClient()

  // Cooldown check against the existing live row.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from(TABLE)
    .select('last_sent_at')
    .eq('email', email)
    .eq('type', args.type)
    .maybeSingle()

  if (existing?.last_sent_at) {
    const elapsed = Date.now() - new Date(existing.last_sent_at).getTime()
    if (elapsed < RESEND_COOLDOWN_MS) {
      return {
        ok: false,
        error: 'Please wait before requesting another code.',
        cooldownSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000),
      }
    }
  }

  const code = randomCode()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertErr } = await (admin as any)
    .from(TABLE)
    .upsert(
      {
        email,
        user_id: args.userId,
        type: args.type,
        code_hash: hashCode(code, email),
        expires_at: expiresAt.toISOString(),
        consumed_at: null,
        attempts: 0,
        last_sent_at: now.toISOString(),
      },
      { onConflict: 'email,type' },
    )

  if (upsertErr) return { ok: false, error: upsertErr.message }

  const res = await sendVerificationCodeEmail({
    to: email,
    props: { purpose: args.type, code, expiresMinutes: Math.round(CODE_TTL_MS / 60000) },
  })
  if (res.error) return { ok: false, error: 'Could not send the code. Try again.' }

  return { ok: true }
}

/**
 * Verifies a submitted code. Consumes it on success; counts attempts and
 * refuses after MAX_ATTEMPTS. Returns the user_id stored with the code.
 */
export async function verifyCode(args: {
  email: string
  type: OtpType
  code: string
}): Promise<{ ok: true; userId: string | null } | { ok: false; error: string }> {
  const email = args.email.toLowerCase()
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row } = (await (admin as any)
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .eq('type', args.type)
    .maybeSingle()) as { data: Row | null }

  if (!row) return { ok: false, error: 'No code found. Request a new one.' }
  if (row.consumed_at) return { ok: false, error: 'This code was already used. Request a new one.' }
  if (Date.now() > new Date(row.expires_at).getTime())
    return { ok: false, error: 'This code has expired. Request a new one.' }
  if (row.attempts >= MAX_ATTEMPTS)
    return { ok: false, error: 'Too many attempts. Request a new code.' }

  const matches = row.code_hash === hashCode(args.code.trim(), email)
  if (!matches) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from(TABLE)
      .update({ attempts: row.attempts + 1 })
      .eq('email', email)
      .eq('type', args.type)
    return { ok: false, error: 'Incorrect code. Please try again.' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from(TABLE)
    .update({ consumed_at: new Date().toISOString() })
    .eq('email', email)
    .eq('type', args.type)

  return { ok: true, userId: row.user_id }
}
