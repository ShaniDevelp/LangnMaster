import * as React from 'react'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface TeacherCourseRequestResultEmailProps {
  teacherName: string
  courseTitle: string
  approved: boolean
  ctaUrl: string
}

/**
 * Sent to a teacher when admin approves or rejects their request to teach a
 * specific course.
 */
export function TeacherCourseRequestResultEmail({
  teacherName,
  courseTitle,
  approved,
  ctaUrl,
}: TeacherCourseRequestResultEmailProps) {
  const firstName = teacherName?.trim().split(' ')[0] || 'there'

  if (approved) {
    return (
      <BaseLayout preview={`You're approved to teach ${courseTitle}.`}>
        <Heading>You&apos;re approved to teach, {firstName}! 🎉</Heading>
        <Paragraph>
          Good news — you&apos;ve been approved to teach{' '}
          <strong>{courseTitle}</strong>. You&apos;re now eligible to be assigned
          groups for this course.
        </Paragraph>
        <Paragraph>
          We&apos;ll notify you as soon as a group is proposed for you.
        </Paragraph>
        <Button href={ctaUrl}>View course</Button>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout preview={`Update on your request to teach ${courseTitle}.`}>
      <Heading>Request update, {firstName}</Heading>
      <Paragraph>
        Thanks for your interest in teaching <strong>{courseTitle}</strong>.
        After review, we&apos;re not able to approve this request right now.
      </Paragraph>
      <Paragraph>
        You can still request other courses that match your expertise.
      </Paragraph>
      <Button href={ctaUrl}>Browse courses</Button>
    </BaseLayout>
  )
}

export function teacherCourseRequestResultEmailText(
  p: TeacherCourseRequestResultEmailProps,
): string {
  const firstName = p.teacherName?.trim().split(' ')[0] || 'there'
  if (p.approved) {
    return [
      `You're approved to teach, ${firstName}!`,
      '',
      `You've been approved to teach ${p.courseTitle}. You're now eligible to be assigned groups for this course.`,
      '',
      `View course: ${p.ctaUrl}`,
      '',
      'Bayyan',
    ].join('\n')
  }
  return [
    `Request update, ${firstName}`,
    '',
    `Thanks for your interest in teaching ${p.courseTitle}. We're not able to approve this request right now.`,
    '',
    `You can still request other courses: ${p.ctaUrl}`,
    '',
    'Bayyan',
  ].join('\n')
}
