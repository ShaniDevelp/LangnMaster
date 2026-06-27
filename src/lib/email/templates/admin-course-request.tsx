import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface AdminCourseRequestEmailProps {
  teacherName: string
  teacherEmail: string
  courseTitle: string
  reviewUrl: string
}

/**
 * Internal notification to admin when a teacher requests to teach a course.
 */
export function AdminCourseRequestEmail({
  teacherName,
  teacherEmail,
  courseTitle,
  reviewUrl,
}: AdminCourseRequestEmailProps) {
  return (
    <BaseLayout preview={`${teacherName} wants to teach ${courseTitle}`}>
      <Heading>New course teaching request 📚</Heading>
      <Paragraph>
        A teacher has requested to teach a course. Review and approve or reject.
      </Paragraph>

      <Row label="Teacher" value={teacherName || '—'} />
      <Row label="Email" value={teacherEmail} />
      <Row label="Course" value={courseTitle} />

      <Button href={reviewUrl}>Review request</Button>
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

const rowStyle: React.CSSProperties = { borderBottom: '1px solid #e5e7eb', padding: '8px 0' }
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

export function adminCourseRequestEmailText(p: AdminCourseRequestEmailProps): string {
  return [
    'New course teaching request',
    '',
    `Teacher: ${p.teacherName || '—'}`,
    `Email:   ${p.teacherEmail}`,
    `Course:  ${p.courseTitle}`,
    '',
    `Review: ${p.reviewUrl}`,
  ].join('\n')
}
