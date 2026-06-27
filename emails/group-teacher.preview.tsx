import { GroupTeacherEmail } from '../src/lib/email/templates/group-teacher'

const Preview = () => (
  <GroupTeacherEmail
    teacherName="Diego Martín"
    courseTitle="Spanish A1 — Conversational"
    studentNames={['Sara Ahmed', 'Omar Khan', 'Lena Fischer']}
  />
)
export default Preview
