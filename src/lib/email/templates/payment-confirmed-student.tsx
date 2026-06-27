import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph, Button } from './base'
import { InfoCard } from './group-student'

export interface PaymentConfirmedStudentEmailProps {
  studentName: string
  courseTitle: string
  teacherName: string
  /** Pre-formatted next session label (in the student's timezone), or null if none scheduled yet. */
  nextSessionLabel: string | null
  dashboardUrl: string
}

/**
 * Sent to a student when an admin verifies their payment. Confirms their sessions
 * are unlocked and points them to the next session (if one is scheduled).
 */
export function PaymentConfirmedStudentEmail({
  studentName,
  courseTitle,
  teacherName,
  nextSessionLabel,
  dashboardUrl,
}: PaymentConfirmedStudentEmailProps) {
  const firstName = studentName?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview={`Payment confirmed for ${courseTitle} — your sessions are unlocked.`}>
      <Heading>Payment confirmed, {firstName}! 🎉</Heading>

      <Paragraph>
        We&apos;ve received and verified your payment for <strong>{courseTitle}</strong>.
        Your live sessions are now unlocked — you&apos;re all set to start learning.
      </Paragraph>

      <InfoCard label="Your teacher" values={[teacherName]} />

      {nextSessionLabel ? (
        <InfoCard label="Your next session" values={[nextSessionLabel]} />
      ) : (
        <Section style={note}>
          <Text style={noteText}>
            📅 Your session schedule will be shared shortly — your group is finalizing times.
          </Text>
        </Section>
      )}

      <Button href={dashboardUrl}>Go to your dashboard</Button>
    </BaseLayout>
  )
}

const note: React.CSSProperties = {
  borderLeft: '3px solid #6c4ff5',
  padding: '4px 0 4px 16px',
  margin: '20px 0 0',
}
const noteText: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '14px',
  lineHeight: '22px',
  margin: 0,
}

export function paymentConfirmedStudentEmailText(p: PaymentConfirmedStudentEmailProps): string {
  const firstName = p.studentName?.trim().split(' ')[0] || 'there'
  return [
    `Payment confirmed, ${firstName}!`,
    '',
    `We've received and verified your payment for ${p.courseTitle}. Your live sessions are now unlocked.`,
    '',
    `Teacher: ${p.teacherName}`,
    p.nextSessionLabel
      ? `Next session: ${p.nextSessionLabel}`
      : 'Your session schedule will be shared shortly.',
    '',
    `Dashboard: ${p.dashboardUrl}`,
    '',
    'Bayyan',
  ].join('\n')
}
