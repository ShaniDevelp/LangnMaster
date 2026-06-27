import { AdminGroupResponseEmail } from '../src/lib/email/templates/admin-group-response'

// Flip status to 'accepted' to preview the other variant.
const Preview = () => (
  <AdminGroupResponseEmail
    teacherName="Diego Martín"
    courseTitle="Spanish A1 — Conversational"
    status="declined"
    reason="Schedule clashes with my existing groups this term."
  />
)
export default Preview
