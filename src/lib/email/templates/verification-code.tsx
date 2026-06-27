import * as React from 'react'
import { BaseLayout, Heading, Paragraph } from './base'

export interface VerificationCodeEmailProps {
  /** What the code unlocks. */
  purpose: 'signup' | 'recovery'
  /** The 6-digit code. */
  code: string
  /** How long the code stays valid, in minutes. */
  expiresMinutes: number
}

const copy = {
  signup: {
    preview: 'Your Bayyan verification code',
    heading: 'Confirm your email',
    intro: 'Enter this code to verify your email and finish setting up your Bayyan account:',
  },
  recovery: {
    preview: 'Your Bayyan password reset code',
    heading: 'Reset your password',
    intro: 'Enter this code to reset your Bayyan password:',
  },
}

/**
 * One-time code email for email verification and password reset. Renders the
 * code large and monospaced so it is easy to read off and type back in.
 */
export function VerificationCodeEmail({ purpose, code, expiresMinutes }: VerificationCodeEmailProps) {
  const c = copy[purpose]
  return (
    <BaseLayout preview={c.preview}>
      <Heading>{c.heading}</Heading>
      <Paragraph>{c.intro}</Paragraph>

      <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '8px 0 4px' }}>
        <tbody>
          <tr>
            <td
              style={{
                background: '#f4f4f7',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px 28px',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '34px',
                fontWeight: 700,
                letterSpacing: '10px',
                color: '#0f0f0f',
                textAlign: 'center',
              }}
            >
              {code}
            </td>
          </tr>
        </tbody>
      </table>

      <Paragraph>
        This code expires in {expiresMinutes} minutes. If you didn&apos;t request it, you can
        safely ignore this email.
      </Paragraph>
    </BaseLayout>
  )
}

/** Plain-text fallback. */
export function verificationCodeEmailText({ purpose, code, expiresMinutes }: VerificationCodeEmailProps): string {
  const c = copy[purpose]
  return [
    c.heading,
    '',
    c.intro,
    '',
    `   ${code}`,
    '',
    `This code expires in ${expiresMinutes} minutes.`,
    "If you didn't request it, you can ignore this email.",
    '',
    'Bayyan',
  ].join('\n')
}
