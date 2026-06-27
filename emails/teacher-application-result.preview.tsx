import { TeacherApplicationResultEmail } from '../src/lib/email/templates/teacher-application-result'

// Flip approved to false to preview the rejection variant.
const Preview = () => (
  <TeacherApplicationResultEmail
    teacherName="Diego Martín"
    approved={true}
    adminNotes="Great intro video — welcome aboard!"
    ctaUrl="https://langmaster.app/teacher/onboarding"
  />
)
export default Preview
