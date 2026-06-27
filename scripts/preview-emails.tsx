/**
 * Renders every email template to a static HTML file in ./email-previews/.
 * Bypasses the react-email preview CLI (broken on Windows: drive-letter case
 * mismatch in its esbuild plugin). Run: npx tsx scripts/preview-emails.tsx
 */
import { render } from '@react-email/render'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as React from 'react'

import { WelcomeEmail } from '../src/lib/email/templates/welcome'
import { EnrolledEmail } from '../src/lib/email/templates/enrolled'
import { AdminEnrollmentEmail } from '../src/lib/email/templates/admin-enrollment'
import { GroupStudentEmail } from '../src/lib/email/templates/group-student'
import { GroupTeacherEmail } from '../src/lib/email/templates/group-teacher'
import { GroupProposalTeacherEmail } from '../src/lib/email/templates/group-proposal-teacher'
import { AdminGroupResponseEmail } from '../src/lib/email/templates/admin-group-response'
import { AdminTeacherApplicationEmail } from '../src/lib/email/templates/admin-teacher-application'
import { TeacherApplicationResultEmail } from '../src/lib/email/templates/teacher-application-result'
import { AdminCourseRequestEmail } from '../src/lib/email/templates/admin-course-request'
import { TeacherCourseRequestResultEmail } from '../src/lib/email/templates/teacher-course-request-result'

const COURSE = 'Spanish A1 — Conversational'

const samples: Array<{ name: string; el: React.ReactElement }> = [
  { name: 'welcome', el: <WelcomeEmail name="Sara Ahmed" role="student" ctaUrl="https://langmaster.app/student/onboarding" /> },
  { name: 'enrolled', el: <EnrolledEmail name="Sara Ahmed" courseTitle={COURSE} /> },
  { name: 'admin-enrollment', el: <AdminEnrollmentEmail studentName="Sara Ahmed" studentEmail="sara@example.com" courseTitle={COURSE} courseLevel="beginner" /> },
  { name: 'group-student', el: <GroupStudentEmail studentName="Sara Ahmed" courseTitle={COURSE} teacherName="Diego Martín" classmateNames={['Omar Khan', 'Lena Fischer']} /> },
  { name: 'group-teacher', el: <GroupTeacherEmail teacherName="Diego Martín" courseTitle={COURSE} studentNames={['Sara Ahmed', 'Omar Khan', 'Lena Fischer']} /> },
  { name: 'group-proposal-teacher', el: <GroupProposalTeacherEmail teacherName="Diego Martín" courseTitle={COURSE} studentCount={3} respondUrl="https://langmaster.app/teacher/proposals" /> },
  { name: 'admin-group-response-declined', el: <AdminGroupResponseEmail teacherName="Diego Martín" courseTitle={COURSE} status="declined" reason="Schedule clashes with my existing groups." /> },
  { name: 'admin-group-response-accepted', el: <AdminGroupResponseEmail teacherName="Diego Martín" courseTitle={COURSE} status="accepted" /> },
  { name: 'admin-teacher-application', el: <AdminTeacherApplicationEmail teacherName="Diego Martín" teacherEmail="diego@example.com" languages={['Spanish', 'Portuguese']} reviewUrl="https://langmaster.app/admin/teachers" /> },
  { name: 'teacher-application-approved', el: <TeacherApplicationResultEmail teacherName="Diego Martín" approved={true} adminNotes="Great intro video — welcome aboard!" ctaUrl="https://langmaster.app/teacher/onboarding" /> },
  { name: 'teacher-application-rejected', el: <TeacherApplicationResultEmail teacherName="Diego Martín" approved={false} adminNotes="Please add a verifiable teaching certification." ctaUrl="https://langmaster.app/teacher/application" /> },
  { name: 'admin-course-request', el: <AdminCourseRequestEmail teacherName="Diego Martín" teacherEmail="diego@example.com" courseTitle={COURSE} reviewUrl="https://langmaster.app/admin/requests" /> },
  { name: 'teacher-course-request-approved', el: <TeacherCourseRequestResultEmail teacherName="Diego Martín" courseTitle={COURSE} approved={true} ctaUrl="https://langmaster.app/teacher/courses/abc" /> },
  { name: 'teacher-course-request-rejected', el: <TeacherCourseRequestResultEmail teacherName="Diego Martín" courseTitle={COURSE} approved={false} ctaUrl="https://langmaster.app/teacher/courses" /> },
]

async function main() {
  const outDir = resolve(process.cwd(), 'email-previews')
  mkdirSync(outDir, { recursive: true })

  const links: string[] = []
  for (const { name, el } of samples) {
    const html = await render(el)
    writeFileSync(resolve(outDir, `${name}.html`), html, 'utf8')
    links.push(`<li><a href="./${name}.html">${name}</a></li>`)
    console.log(`✓ ${name}.html`)
  }

  writeFileSync(
    resolve(outDir, 'index.html'),
    `<!doctype html><meta charset="utf-8"><title>Bayyan email previews</title>
     <body style="font-family:sans-serif;max-width:640px;margin:40px auto;">
     <h1>Bayyan email previews</h1><ul>${links.join('')}</ul></body>`,
    'utf8',
  )
  console.log(`\nDone. Open: ${resolve(outDir, 'index.html')}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
