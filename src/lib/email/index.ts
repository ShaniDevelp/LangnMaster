import 'server-only'
import { render } from '@react-email/render'
import { getEmailProvider, type SendResult } from './provider'
import {
  WelcomeEmail,
  welcomeEmailText,
  type WelcomeEmailProps,
} from './templates/welcome'
import {
  EnrolledEmail,
  enrolledEmailText,
  type EnrolledEmailProps,
} from './templates/enrolled'
import {
  AdminEnrollmentEmail,
  adminEnrollmentEmailText,
  type AdminEnrollmentEmailProps,
} from './templates/admin-enrollment'
import {
  GroupStudentEmail,
  groupStudentEmailText,
  type GroupStudentEmailProps,
} from './templates/group-student'
import {
  GroupTeacherEmail,
  groupTeacherEmailText,
  type GroupTeacherEmailProps,
} from './templates/group-teacher'
import {
  GroupProposalTeacherEmail,
  groupProposalTeacherEmailText,
  type GroupProposalTeacherEmailProps,
} from './templates/group-proposal-teacher'
import {
  AdminGroupResponseEmail,
  adminGroupResponseEmailText,
  type AdminGroupResponseEmailProps,
} from './templates/admin-group-response'
import {
  AdminTeacherApplicationEmail,
  adminTeacherApplicationEmailText,
  type AdminTeacherApplicationEmailProps,
} from './templates/admin-teacher-application'
import {
  TeacherApplicationResultEmail,
  teacherApplicationResultEmailText,
  type TeacherApplicationResultEmailProps,
} from './templates/teacher-application-result'
import {
  AdminCourseRequestEmail,
  adminCourseRequestEmailText,
  type AdminCourseRequestEmailProps,
} from './templates/admin-course-request'
import {
  TeacherCourseRequestResultEmail,
  teacherCourseRequestResultEmailText,
  type TeacherCourseRequestResultEmailProps,
} from './templates/teacher-course-request-result'
import {
  PaymentConfirmedStudentEmail,
  paymentConfirmedStudentEmailText,
  type PaymentConfirmedStudentEmailProps,
} from './templates/payment-confirmed-student'
import {
  PaymentConfirmedTeacherEmail,
  paymentConfirmedTeacherEmailText,
  type PaymentConfirmedTeacherEmailProps,
} from './templates/payment-confirmed-teacher'
import {
  VerificationCodeEmail,
  verificationCodeEmailText,
  type VerificationCodeEmailProps,
} from './templates/verification-code'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://langmaster.app'

/**
 * High-level senders. Callers use these — they never touch the provider or
 * render HTML directly. Each one: build props -> render template -> send.
 */

export async function sendWelcomeEmail(args: {
  to: string
  name: string
  role: 'student' | 'teacher'
}): Promise<SendResult> {
  const ctaPath = args.role === 'teacher' ? '/teacher/application' : '/student/onboarding'
  const props: WelcomeEmailProps = {
    name: args.name,
    role: args.role,
    ctaUrl: `${appUrl}${ctaPath}`,
  }

  const html = await render(WelcomeEmail(props))
  const text = welcomeEmailText(props)

  return getEmailProvider().send({
    to: args.to,
    subject: 'Welcome to Bayyan 🎉',
    html,
    text,
  })
}

export async function sendVerificationCodeEmail(args: {
  to: string
  props: VerificationCodeEmailProps
}): Promise<SendResult> {
  const html = await render(VerificationCodeEmail(args.props))
  const text = verificationCodeEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject:
      args.props.purpose === 'signup'
        ? `Your Bayyan verification code: ${args.props.code}`
        : `Your Bayyan password reset code: ${args.props.code}`,
    html,
    text,
  })
}

export async function sendEnrolledEmail(args: {
  to: string
  name: string
  courseTitle: string
}): Promise<SendResult> {
  const props: EnrolledEmailProps = {
    name: args.name,
    courseTitle: args.courseTitle,
  }

  const html = await render(EnrolledEmail(props))
  const text = enrolledEmailText(props)

  return getEmailProvider().send({
    to: args.to,
    subject: `You're enrolled in ${args.courseTitle} ✅`,
    html,
    text,
  })
}

export async function sendAdminEnrollmentEmail(
  args: AdminEnrollmentEmailProps,
): Promise<SendResult> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return { id: null, error: 'ADMIN_EMAIL not configured' }

  const html = await render(AdminEnrollmentEmail(args))
  const text = adminEnrollmentEmailText(args)

  return getEmailProvider().send({
    to,
    subject: `New enrollment: ${args.studentName || args.studentEmail} → ${args.courseTitle}`,
    html,
    text,
  })
}

export async function sendGroupStudentEmail(args: {
  to: string
  props: GroupStudentEmailProps
}): Promise<SendResult> {
  const html = await render(GroupStudentEmail(args.props))
  const text = groupStudentEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: `Your group for ${args.props.courseTitle} is ready 👥`,
    html,
    text,
  })
}

export async function sendGroupTeacherEmail(args: {
  to: string
  props: GroupTeacherEmailProps
}): Promise<SendResult> {
  const html = await render(GroupTeacherEmail(args.props))
  const text = groupTeacherEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: `Your group for ${args.props.courseTitle} is live 🎓`,
    html,
    text,
  })
}

export async function sendGroupProposalTeacherEmail(args: {
  to: string
  props: GroupProposalTeacherEmailProps
}): Promise<SendResult> {
  const html = await render(GroupProposalTeacherEmail(args.props))
  const text = groupProposalTeacherEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: `New group request for ${args.props.courseTitle} — please respond 📩`,
    html,
    text,
  })
}

export async function sendAdminGroupResponseEmail(
  args: AdminGroupResponseEmailProps,
): Promise<SendResult> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return { id: null, error: 'ADMIN_EMAIL not configured' }

  const html = await render(AdminGroupResponseEmail(args))
  const text = adminGroupResponseEmailText(args)

  const verb = args.status === 'accepted' ? 'accepted' : 'declined'
  return getEmailProvider().send({
    to,
    subject: `${args.teacherName} ${verb} group — ${args.courseTitle}`,
    html,
    text,
  })
}

export async function sendPaymentConfirmedStudentEmail(args: {
  to: string
  props: PaymentConfirmedStudentEmailProps
}): Promise<SendResult> {
  const html = await render(PaymentConfirmedStudentEmail(args.props))
  const text = paymentConfirmedStudentEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: `Payment confirmed — you're all set for ${args.props.courseTitle} 🎉`,
    html,
    text,
  })
}

export async function sendPaymentConfirmedTeacherEmail(args: {
  to: string
  props: PaymentConfirmedTeacherEmailProps
}): Promise<SendResult> {
  const html = await render(PaymentConfirmedTeacherEmail(args.props))
  const text = paymentConfirmedTeacherEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: `${args.props.studentName} is now active in ${args.props.courseTitle} ✅`,
    html,
    text,
  })
}

export async function sendAdminTeacherApplicationEmail(
  args: AdminTeacherApplicationEmailProps,
): Promise<SendResult> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return { id: null, error: 'ADMIN_EMAIL not configured' }

  const html = await render(AdminTeacherApplicationEmail(args))
  const text = adminTeacherApplicationEmailText(args)

  return getEmailProvider().send({
    to,
    subject: `New teacher application: ${args.teacherName || args.teacherEmail} 🧑‍🏫`,
    html,
    text,
  })
}

export async function sendTeacherApplicationResultEmail(args: {
  to: string
  props: TeacherApplicationResultEmailProps
}): Promise<SendResult> {
  const html = await render(TeacherApplicationResultEmail(args.props))
  const text = teacherApplicationResultEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: args.props.approved
      ? 'Your Bayyan teacher application is approved 🎉'
      : 'Update on your Bayyan teacher application',
    html,
    text,
  })
}

export async function sendAdminCourseRequestEmail(
  args: AdminCourseRequestEmailProps,
): Promise<SendResult> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return { id: null, error: 'ADMIN_EMAIL not configured' }

  const html = await render(AdminCourseRequestEmail(args))
  const text = adminCourseRequestEmailText(args)

  return getEmailProvider().send({
    to,
    subject: `Course request: ${args.teacherName || args.teacherEmail} → ${args.courseTitle} 📚`,
    html,
    text,
  })
}

export async function sendTeacherCourseRequestResultEmail(args: {
  to: string
  props: TeacherCourseRequestResultEmailProps
}): Promise<SendResult> {
  const html = await render(TeacherCourseRequestResultEmail(args.props))
  const text = teacherCourseRequestResultEmailText(args.props)

  return getEmailProvider().send({
    to: args.to,
    subject: args.props.approved
      ? `You're approved to teach ${args.props.courseTitle} 🎉`
      : `Update on your request to teach ${args.props.courseTitle}`,
    html,
    text,
  })
}
