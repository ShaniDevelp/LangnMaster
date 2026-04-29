import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'

type EnrollmentRow = Enrollment & { courses: Pick<Course, 'name' | 'language'> | null }

export default async function StudentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, enrollmentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('enrollments').select('*, courses(name, language)').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
  ])

  if (!profileRes.data) redirect('/login')

  return (
    <ProfileForm
      profile={profileRes.data as unknown as Profile}
      enrollments={(enrollmentsRes.data ?? []) as unknown as EnrollmentRow[]}
    />
  )
}
