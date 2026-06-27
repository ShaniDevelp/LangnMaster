import * as React from 'react'
import { Section, Text } from '@react-email/components'
import { BaseLayout, Heading, Paragraph, Button } from './base'

export interface TeacherApplicationResultEmailProps {
  teacherName: string
  approved: boolean
  adminNotes?: string | null
  ctaUrl: string
}

/**
 * Sent to a teacher when admin approves or rejects their application.
 */
export function TeacherApplicationResultEmail({
  teacherName,
  approved,
  adminNotes,
  ctaUrl,
}: TeacherApplicationResultEmailProps) {
  const firstName = teacherName?.trim().split(' ')[0] || 'there'

  if (approved) {
    return (
      <BaseLayout preview="Your Bayyan teacher application is approved.">
        <Heading>You&apos;re approved, {firstName}! 🎉</Heading>
        <Paragraph>
          Congratulations — your teacher application has been approved. One step
          left: complete your onboarding so we can match you with student groups.
        </Paragraph>
        {adminNotes && <NotesBox label="Note from our team" text={adminNotes} accent="#16a34a" />}
        <Button href={ctaUrl}>Complete onboarding</Button>
      </BaseLayout>
    )
  }

  return (
    <BaseLayout preview="Update on your Bayyan teacher application.">
      <Heading>Application update, {firstName}</Heading>
      <Paragraph>
        Thanks for applying to teach on Bayyan. After review, we&apos;re not
        able to approve your application at this time.
      </Paragraph>
      {adminNotes && <NotesBox label="Reviewer feedback" text={adminNotes} accent="#dc2626" />}
      <Paragraph>
        You&apos;re welcome to update your details and submit again.
      </Paragraph>
      <Button href={ctaUrl}>Update &amp; resubmit</Button>
    </BaseLayout>
  )
}

function NotesBox({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <Section style={{ borderLeft: `3px solid ${accent}`, padding: '4px 0 4px 16px', margin: '0 0 16px' }}>
      <Text style={notesLabel}>{label}</Text>
      <Text style={notesText}>{text}</Text>
    </Section>
  )
}

const notesLabel: React.CSSProperties = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: '0 0 4px',
}
const notesText: React.CSSProperties = {
  color: '#0f0f0f',
  fontSize: '15px',
  lineHeight: '22px',
  margin: 0,
}

export function teacherApplicationResultEmailText(p: TeacherApplicationResultEmailProps): string {
  const firstName = p.teacherName?.trim().split(' ')[0] || 'there'
  const notes = p.adminNotes ? ['', `Note: ${p.adminNotes}`] : []
  if (p.approved) {
    return [
      `You're approved, ${firstName}!`,
      '',
      'Your teacher application has been approved. Complete your onboarding to get matched with student groups.',
      ...notes,
      '',
      `Complete onboarding: ${p.ctaUrl}`,
      '',
      'Bayyan',
    ].join('\n')
  }
  return [
    `Application update, ${firstName}`,
    '',
    "Thanks for applying. We're not able to approve your application at this time.",
    ...notes,
    '',
    "You're welcome to update your details and submit again.",
    `Resubmit: ${p.ctaUrl}`,
    '',
    'Bayyan',
  ].join('\n')
}
