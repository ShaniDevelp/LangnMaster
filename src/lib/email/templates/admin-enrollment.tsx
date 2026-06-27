import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph } from './base'

export interface AdminEnrollmentEmailProps {
  studentName: string
  studentEmail: string
  courseTitle: string
  courseLevel: string
}

/**
 * Internal notification to admin when a student enrolls. Plain data summary —
 * still uses BaseLayout so internal mail matches the brand.
 */
export function AdminEnrollmentEmail({
  studentName,
  studentEmail,
  courseTitle,
  courseLevel,
}: AdminEnrollmentEmailProps) {
  return (
    <BaseLayout preview={`New enrollment: ${studentName} → ${courseTitle}`}>
      <Heading>New course enrollment</Heading>
      <Paragraph>A student just enrolled. Assign them to a group when ready.</Paragraph>

      <Row label="Student" value={studentName || '—'} />
      <Row label="Email" value={studentEmail} />
      <Row label="Course" value={courseTitle} />
      <Row label="Level" value={courseLevel} />
    </BaseLayout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={rowStyle}>
      <Text style={labelStyle}>{label}</Text>
      <Text style={valueStyle}>{value}</Text>
    </Section>
  )
}

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #e5e7eb',
  padding: '8px 0',
}
const labelStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: '0 0 2px',
}
const valueStyle: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '15px',
  fontWeight: 600,
  margin: 0,
}

export function adminEnrollmentEmailText(p: AdminEnrollmentEmailProps): string {
  return [
    'New course enrollment',
    '',
    `Student: ${p.studentName || '—'}`,
    `Email:   ${p.studentEmail}`,
    `Course:  ${p.courseTitle}`,
    `Level:   ${p.courseLevel}`,
    '',
    'Assign them to a group when ready.',
  ].join('\n')
}
