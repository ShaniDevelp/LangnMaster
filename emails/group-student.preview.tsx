import { GroupStudentEmail } from '../src/lib/email/templates/group-student'

const Preview = () => (
  <GroupStudentEmail
    studentName="Sara Ahmed"
    courseTitle="Spanish A1 — Conversational"
    teacherName="Diego Martín"
    classmateNames={['Omar Khan', 'Lena Fischer']}
  />
)
export default Preview
