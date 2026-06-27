import * as React from 'react'
import { BaseLayout, Heading, Paragraph } from './base'
import {
  Section,
  Text,
} from '@react-email/components'

export interface EnrolledEmailProps {
  name: string
  courseTitle: string
}

/**
 * Sent on successful (pre-payment) course enrollment. Explains the flow:
 * enrolled -> grouped by level -> pay once group assigned -> attend sessions.
 * Body only; chrome/branding inherited from BaseLayout.
 */
export function EnrolledEmail({ name, courseTitle }: EnrolledEmailProps) {
  const firstName = name?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview={`You're enrolled in ${courseTitle}.`}>
      <Heading>You&apos;re enrolled, {firstName}! ✅</Heading>

      <Paragraph>
        You&apos;re now enrolled in <strong>{courseTitle}</strong>. Here&apos;s
        what happens next.
      </Paragraph>

      <Steps
        items={[
          'We place you in a group with other students at your level — so every session matches your pace.',
          'Once your group is assigned, you’ll get a notification to complete payment.',
          'After payment, you can start attending live sessions with your group.',
        ]}
      />

      <Paragraph>
        No payment is needed yet — you only pay once your group is ready. We&apos;ll
        email you the moment that happens.
      </Paragraph>
    </BaseLayout>
  )
}

function Steps({ items }: { items: string[] }) {
  return (
    <Section style={{ margin: '8px 0 20px' }}>
      {items.map((item, i) => (
        <Section key={i} style={stepRow}>
          <Text style={stepNum}>{i + 1}</Text>
          <Text style={stepText}>{item}</Text>
        </Section>
      ))}
    </Section>
  )
}

const stepRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '12px',
}
const stepNum: React.CSSProperties = {
  backgroundColor: '#6c4ff5',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 700,
  width: '24px',
  height: '24px',
  borderRadius: '12px',
  textAlign: 'center',
  lineHeight: '24px',
  margin: '0 12px 0 0',
  flexShrink: 0,
}
const stepText: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: 0,
}

/** Plain-text fallback. */
export function enrolledEmailText({ name, courseTitle }: EnrolledEmailProps): string {
  const firstName = name?.trim().split(' ')[0] || 'there'
  return [
    `You're enrolled, ${firstName}!`,
    '',
    `You're now enrolled in ${courseTitle}. Here's what happens next:`,
    '',
    '1. We place you in a group with other students at your level.',
    "2. Once your group is assigned, you'll get a notification to complete payment.",
    '3. After payment, you can start attending live sessions with your group.',
    '',
    "No payment is needed yet — you only pay once your group is ready. We'll email you when that happens.",
    '',
    'Bayyan',
  ].join('\n')
}
