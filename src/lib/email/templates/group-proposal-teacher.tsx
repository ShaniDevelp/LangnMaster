import * as React from 'react'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface GroupProposalTeacherEmailProps {
  teacherName: string
  courseTitle: string
  studentCount: number
  respondUrl: string
}

/**
 * Sent to a teacher when a group is PROPOSED (acceptance gate on). Distinct from
 * the "group is live" email — this one asks the teacher to accept/decline.
 */
export function GroupProposalTeacherEmail({
  teacherName,
  courseTitle,
  studentCount,
  respondUrl,
}: GroupProposalTeacherEmailProps) {
  const firstName = teacherName?.trim().split(' ')[0] || 'there'
  const students =
    studentCount === 1 ? '1 student' : `${studentCount} students`

  return (
    <BaseLayout preview={`New group request for ${courseTitle} — please respond.`}>
      <Heading>New group request, {firstName} 📩</Heading>

      <Paragraph>
        A new group for <strong>{courseTitle}</strong> ({students}) has been
        assigned to you and is waiting for your response.
      </Paragraph>

      <Paragraph>
        Review the roster and proposed schedule, then accept or decline. The
        group only goes live — and students are notified — once you accept.
      </Paragraph>

      <Button href={respondUrl}>Respond to request</Button>

      <Paragraph>
        Please respond soon so we can get your students started.
      </Paragraph>
    </BaseLayout>
  )
}

export function groupProposalTeacherEmailText(p: GroupProposalTeacherEmailProps): string {
  const firstName = p.teacherName?.trim().split(' ')[0] || 'there'
  const students = p.studentCount === 1 ? '1 student' : `${p.studentCount} students`
  return [
    `New group request, ${firstName}`,
    '',
    `A new group for ${p.courseTitle} (${students}) has been assigned to you and is waiting for your response.`,
    '',
    'Review the roster and proposed schedule, then accept or decline. The group only goes live once you accept.',
    '',
    `Respond here: ${p.respondUrl}`,
    '',
    'Bayyan',
  ].join('\n')
}
