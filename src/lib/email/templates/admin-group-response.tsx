import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph } from './base'

export interface AdminGroupResponseEmailProps {
  teacherName: string
  courseTitle: string
  status: 'accepted' | 'declined'
  reason?: string | null
}

/**
 * Internal notification to admin when a teacher accepts or declines a group
 * proposal. Tells admin the outcome and the next action.
 */
export function AdminGroupResponseEmail({
  teacherName,
  courseTitle,
  status,
  reason,
}: AdminGroupResponseEmailProps) {
  const accepted = status === 'accepted'

  return (
    <BaseLayout
      preview={`${teacherName} ${accepted ? 'accepted' : 'declined'} ${courseTitle}`}
    >
      <Heading>
        Group {accepted ? 'accepted' : 'declined'} {accepted ? '✅' : '⚠️'}
      </Heading>

      <Paragraph>
        <strong>{teacherName}</strong> has {accepted ? 'accepted' : 'declined'}{' '}
        the group proposal for <strong>{courseTitle}</strong>.
      </Paragraph>

      {!accepted && reason && (
        <Section style={reasonBox}>
          <Text style={reasonLabel}>Reason given</Text>
          <Text style={reasonText}>{reason}</Text>
        </Section>
      )}

      <Section style={accented(accepted)}>
        <Text style={nextLabel}>Next step</Text>
        <Text style={nextText}>
          {accepted
            ? 'Nothing needed — the group is live and students have been notified. They unlock sessions once they pay.'
            : 'Reassign this group to another approved teacher from the admin dashboard.'}
        </Text>
      </Section>
    </BaseLayout>
  )
}

const reasonBox: React.CSSProperties = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 16px',
}
const reasonLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: '0 0 4px',
}
const reasonText: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '15px',
  lineHeight: '22px',
  margin: 0,
}
const accented = (accepted: boolean): React.CSSProperties => ({
  borderLeft: `3px solid ${accepted ? '#16a34a' : '#dc2626'}`,
  padding: '4px 0 4px 16px',
  margin: '8px 0 0',
})
const nextLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: '0 0 4px',
}
const nextText: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '15px',
  lineHeight: '22px',
  margin: 0,
}

export function adminGroupResponseEmailText(p: AdminGroupResponseEmailProps): string {
  const accepted = p.status === 'accepted'
  const next = accepted
    ? 'Nothing needed — the group is live and students have been notified.'
    : 'Reassign this group to another approved teacher from the admin dashboard.'
  return [
    `Group ${accepted ? 'accepted' : 'declined'}`,
    '',
    `${p.teacherName} has ${accepted ? 'accepted' : 'declined'} the group proposal for ${p.courseTitle}.`,
    ...(!accepted && p.reason ? ['', `Reason: ${p.reason}`] : []),
    '',
    `Next step: ${next}`,
    '',
    'Bayyan',
  ].join('\n')
}
