import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph } from './base'

export interface GroupStudentEmailProps {
  studentName: string
  courseTitle: string
  teacherName: string
  classmateNames: string[]
}

/**
 * Sent to each student when their group is published. Shows who the teacher is
 * and (if any) who the other students are, then the payment-unlock note.
 */
export function GroupStudentEmail({
  studentName,
  courseTitle,
  teacherName,
  classmateNames,
}: GroupStudentEmailProps) {
  const firstName = studentName?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview={`Your group for ${courseTitle} is ready.`}>
      <Heading>Your group is ready, {firstName}! 👥</Heading>

      <Paragraph>
        You&apos;ve been placed in a group for <strong>{courseTitle}</strong>.
        Here&apos;s who you&apos;ll be learning with.
      </Paragraph>

      <InfoCard label="Your teacher" values={[teacherName]} />

      {classmateNames.length > 0 && (
        <InfoCard
          label={classmateNames.length === 1 ? 'Your classmate' : 'Your classmates'}
          values={classmateNames}
        />
      )}

      <PaymentNote />
    </BaseLayout>
  )
}

export function InfoCard({ label, values }: { label: string; values: string[] }) {
  return (
    <Section style={card}>
      <Text style={cardLabel}>{label}</Text>
      {values.map((v, i) => (
        <Text key={i} style={cardValue}>
          {v}
        </Text>
      ))}
    </Section>
  )
}

export function PaymentNote() {
  return (
    <Section style={note}>
      <Text style={noteText}>
        🔒 Your sessions are locked until payment is complete. Once you pay,
        your full schedule unlocks and you can start attending live sessions.
      </Text>
    </Section>
  )
}

const card: React.CSSProperties = {
  backgroundColor: '#f0f0ff',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 12px',
}
const cardLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: '0 0 6px',
}
const cardValue: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '16px',
  fontWeight: 600,
  margin: '0 0 2px',
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

export function groupStudentEmailText(p: GroupStudentEmailProps): string {
  const firstName = p.studentName?.trim().split(' ')[0] || 'there'
  const mates = p.classmateNames.length
    ? `Classmates: ${p.classmateNames.join(', ')}`
    : 'You are the first in your group — classmates may be added later.'
  return [
    `Your group is ready, ${firstName}!`,
    '',
    `You've been placed in a group for ${p.courseTitle}.`,
    '',
    `Teacher: ${p.teacherName}`,
    mates,
    '',
    'Your sessions are locked until payment is complete. Once you pay, your schedule unlocks and you can start attending live sessions.',
    '',
    'Bayyan',
  ].join('\n')
}
