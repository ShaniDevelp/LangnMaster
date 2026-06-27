import * as React from 'react'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface WelcomeEmailProps {
  name: string
  role: 'student' | 'teacher'
  ctaUrl: string
}

/**
 * Sent on successful signup. Body only — all chrome/branding comes from
 * BaseLayout, so this stays consistent with every other email automatically.
 */
export function WelcomeEmail({ name, role, ctaUrl }: WelcomeEmailProps) {
  const firstName = name?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview="Welcome to Bayyan — your account is ready.">
      <Heading>Welcome to Bayyan, {firstName}! 🎉</Heading>

      <Paragraph>
        Your account is ready. Bayyan pairs you with live language sessions
        so you learn by speaking, not just studying.
      </Paragraph>

      {role === 'teacher' ? (
        <Paragraph>
          Next step: finish your teacher application so we can review your
          profile and get you in front of students.
        </Paragraph>
      ) : (
        <Paragraph>
          Next step: complete onboarding so we can match you to the right cohort
          and schedule your first session.
        </Paragraph>
      )}

      <Button href={ctaUrl}>
        {role === 'teacher' ? 'Complete your application' : 'Start onboarding'}
      </Button>

      <Paragraph>
        Questions? Just reply to this email — a real human reads it.
      </Paragraph>
    </BaseLayout>
  )
}

/** Plain-text fallback for clients that block HTML. */
export function welcomeEmailText({ name, role, ctaUrl }: WelcomeEmailProps): string {
  const firstName = name?.trim().split(' ')[0] || 'there'
  const next =
    role === 'teacher'
      ? 'Finish your teacher application so we can review your profile.'
      : 'Complete onboarding so we can match you to a cohort.'
  return [
    `Welcome to Bayyan, ${firstName}!`,
    '',
    'Your account is ready. Bayyan pairs you with live language sessions so you learn by speaking.',
    '',
    next,
    '',
    `Get started: ${ctaUrl}`,
    '',
    'Questions? Just reply to this email.',
    '',
    'Bayyan',
  ].join('\n')
}
