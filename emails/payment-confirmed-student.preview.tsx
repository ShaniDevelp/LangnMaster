import { PaymentConfirmedStudentEmail } from '../src/lib/email/templates/payment-confirmed-student'

const Preview = () => (
  <PaymentConfirmedStudentEmail
    studentName="Sara Ahmed"
    courseTitle="Spanish A1 — Conversational"
    teacherName="Diego Martín"
    nextSessionLabel="Mon, Jun 23, 6:00 PM PKT"
    dashboardUrl="https://langmaster.app/student/dashboard"
  />
)
export default Preview
