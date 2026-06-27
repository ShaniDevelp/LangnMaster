import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph } from './base'
import { InfoCard } from './group-student'

export interface GroupTeacherEmailProps {
  teacherName: string
  courseTitle: string
  studentNames: string[]
}

/**
 * Sent to the teacher when their group is published. Lists the students; notes
 * sessions unlock per-student once each pays.
 */
export function GroupTeacherEmail({
  teacherName,
  courseTitle,
  studentNames,
}: GroupTeacherEmailProps) {
  const firstName = teacherName?.trim().split(' ')[0] || 'there'

  return (
    <BaseLayout preview={`Your group for ${courseTitle} is live.`}>
      <Heading>Your group is live, {firstName}! 🎓</Heading>

      <Paragraph>
        A new group for <strong>{courseTitle}</strong> has been assigned to you.
        Here are your students.
      </Paragraph>

      <InfoCard
        label={studentNames.length === 1 ? 'Your student' : `Your students (${studentNames.length})`}
        values={studentNames.length ? studentNames : ['—']}
      />

      <Section style={note}>
        <Text style={noteText}>
          🔒 Each student&apos;s sessions unlock once they complete payment.
          You&apos;ll see them join as payments come in.
        </Text>
      </Section>
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

export function groupTeacherEmailText(p: GroupTeacherEmailProps): string {
  const firstName = p.teacherName?.trim().split(' ')[0] || 'there'
  return [
    `Your group is live, ${firstName}!`,
    '',
    `A new group for ${p.courseTitle} has been assigned to you.`,
    '',
    `Students: ${p.studentNames.length ? p.studentNames.join(', ') : '—'}`,
    '',
    "Each student's sessions unlock once they complete payment.",
    '',
    'Bayyan',
  ].join('\n')
}
