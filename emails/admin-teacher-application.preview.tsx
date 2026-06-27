import { AdminTeacherApplicationEmail } from '../src/lib/email/templates/admin-teacher-application'

const Preview = () => (
  <AdminTeacherApplicationEmail
    teacherName="Diego Martín"
    teacherEmail="diego@example.com"
    languages={['Spanish', 'Portuguese']}
    reviewUrl="https://langmaster.app/admin/teachers"
  />
)
export default Preview
