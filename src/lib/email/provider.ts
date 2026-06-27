import 'server-only'
import { Resend } from 'resend'

/**
 * Provider-agnostic email contract.
 *
 * Templates render to plain HTML/text and are handed to a provider through
 * this interface only. Swapping Resend for SES/Postmark/etc. means writing a
 * new EmailProvider implementation — nothing else in the app changes.
 */
export interface EmailMessage {
  to: string | string[]
  subject: string
  html: string
  text: string
  /** Optional override; defaults to EMAIL_FROM env. */
  from?: string
  replyTo?: string
}

export interface SendResult {
  id: string | null
  error: string | null
}

export interface EmailProvider {
  send(msg: EmailMessage): Promise<SendResult>
}

// --- Resend implementation (the one swappable piece) -----------------------

class ResendProvider implements EmailProvider {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(msg: EmailMessage): Promise<SendResult> {
    const from = msg.from ?? process.env.EMAIL_FROM
    if (!from) return { id: null, error: 'EMAIL_FROM not configured' }

    const { data, error } = await this.client.emails.send({
      from,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo,
    })

    if (error) return { id: null, error: error.message }
    return { id: data?.id ?? null, error: null }
  }
}

// --- Provider selection ----------------------------------------------------

let cached: EmailProvider | null = null

/**
 * Returns the active provider. To switch services, change only this function.
 */
export function getEmailProvider(): EmailProvider {
  if (cached) return cached

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not configured')

  cached = new ResendProvider(apiKey)
  return cached
}
