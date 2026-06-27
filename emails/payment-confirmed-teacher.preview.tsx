import { PaymentConfirmedTeacherEmail } from '../src/lib/email/templates/payment-confirmed-teacher'

const Preview = () => (
  <PaymentConfirmedTeacherEmail
    teacherName="Diego Martín"
    studentName="Sara Ahmed"
    courseTitle="Spanish A1 — Conversational"
    nextSessionLabel="Mon, Jun 23, 6:00 PM PKT"
    dashboardUrl="https://langmaster.app/teacher/dashboard"
  />
)
export default Preview
