import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PendingPageClient } from './PendingPageClient'

type ApplicationRow = {
  status: string
  submitted_at: string
  admin_notes: string | null
  languages_taught: { lang: string; proficiency: string }[] | null
  certifications: string[] | null
}

export default async function TeacherPendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: appRaw } = await (supabase as any)
    .from('teacher_applications')
    .select('status, submitted_at, admin_notes, languages_taught, certifications')
    .eq('user_id', user.id)
    .single()
  const app = appRaw as ApplicationRow | null

  const status = !app ? 'none' : app.status

  // Immediately redirect if already approved or no application
  if (status === 'approved') {
    redirect(`/api/auth/set-teacher-state?next=/teacher/onboarding`)
  }
  if (status === 'none') {
    redirect('/teacher/application')
  }

  return <PendingPageClient userId={user.id} initialApp={app!} />
}
