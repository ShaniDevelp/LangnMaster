import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph, Button } from './base'
import { InfoCard } from './group-student'

export interface PaymentConfirmedTeacherEmailProps {
  teacherName: string
  studentName: string
  courseTitle: string
  /** Pre-formatted next session label (in the teacher's timezone), or null if none scheduled yet. */
  nextSessionLabel: string | null
  dashboardUrl: string
}

/**
 * Sent to a teacher when an admin verifies a student's payment. The student is now
 * active in the group; flags the next session so the teacher can prepare.
 */
export function PaymentConfirmedTeacherEmail({
  teacherName,
  studentName,
  courseTitle,
  nextSessionLabel,
  dashboardUrl,
}: PaymentConfirmedTeacherEmailProps) {
  const firstName = teacherName?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview={`${studentName} is now active in ${courseTitle}.`}>
      <Heading>A student is ready, {firstName} ✅</Heading>

      <Paragraph>
        <strong>{studentName}</strong> has completed payment for <strong>{courseTitle}</strong> and
        is now active in your group. They&apos;ll be joining your live sessions.
      </Paragraph>

      {nextSessionLabel ? (
        <InfoCard label="Your next session" values={[nextSessionLabel]} />
      ) : (
        <Section style={note}>
          <Text style={noteText}>
            📅 No upcoming session is scheduled yet — set up the group&apos;s session times when ready.
          </Text>
        </Section>
      )}

      <Button href={dashboardUrl}>Open your dashboard</Button>
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

export function paymentConfirmedTeacherEmailText(p: PaymentConfirmedTeacherEmailProps): string {
  const firstName = p.teacherName?.trim().split(' ')[0] || 'there'
  return [
    `A student is ready, ${firstName}`,
    '',
    `${p.studentName} has completed payment for ${p.courseTitle} and is now active in your group.`,
    '',
    p.nextSessionLabel
      ? `Next session: ${p.nextSessionLabel}`
      : 'No upcoming session is scheduled yet — set up the group session times when ready.',
    '',
    `Dashboard: ${p.dashboardUrl}`,
    '',
    'Bayyan',
  ].join('\n')
}
