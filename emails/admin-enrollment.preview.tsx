import { AdminEnrollmentEmail } from '../src/lib/email/templates/admin-enrollment'

const Preview = () => (
  <AdminEnrollmentEmail
    studentName="Sara Ahmed"
    studentEmail="sara@example.com"
    courseTitle="Spanish A1 — Conversational"
    courseLevel="beginner"
  />
)
export default Preview
