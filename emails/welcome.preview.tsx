import { WelcomeEmail } from '../src/lib/email/templates/welcome'

const Preview = () => (
  <WelcomeEmail name="Sara Ahmed" role="student" ctaUrl="https://langmaster.app/student/onboarding" />
)
Preview.PreviewProps = {}
export default Preview
