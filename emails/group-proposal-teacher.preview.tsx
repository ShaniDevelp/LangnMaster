import { GroupProposalTeacherEmail } from '../src/lib/email/templates/group-proposal-teacher'

const Preview = () => (
  <GroupProposalTeacherEmail
    teacherName="Diego Martín"
    courseTitle="Spanish A1 — Conversational"
    studentCount={3}
    respondUrl="https://langmaster.app/teacher/proposals"
  />
)
export default Preview
