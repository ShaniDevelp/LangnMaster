import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface AdminTeacherApplicationEmailProps {
  teacherName: string
  teacherEmail: string
  languages: string[]
  reviewUrl: string
}

/**
 * Internal notification to admin when a teacher submits an application.
 */
export function AdminTeacherApplicationEmail({
  teacherName,
  teacherEmail,
  languages,
  reviewUrl,
}: AdminTeacherApplicationEmailProps) {
  return (
    <BaseLayout preview={`New teacher application: ${teacherName}`}>
      <Heading>New teacher application 🧑‍🏫</Heading>
      <Paragraph>
        A new teacher has submitted an application. Review it and approve or
        reject.
      </Paragraph>

      <Row label="Teacher" value={teacherName || '—'} />
      <Row label="Email" value={teacherEmail} />
      <Row label="Teaches" value={languages.length ? languages.join(', ') : '—'} />

      <Button href={reviewUrl}>Review application</Button>
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

export function adminTeacherApplicationEmailText(p: AdminTeacherApplicationEmailProps): string {
  return [
    'New teacher application',
    '',
    `Teacher: ${p.teacherName || '—'}`,
    `Email:   ${p.teacherEmail}`,
    `Teaches: ${p.languages.length ? p.languages.join(', ') : '—'}`,
    '',
    `Review: ${p.reviewUrl}`,
  ].join('\n')
}
