import { createAdminClient } from '@/lib/supabase/server'
import { TeachersClient } from './TeachersClient'

type ApplicationRow = {
  status: string
  submitted_at: string
  admin_notes: string | null
  languages_taught: { lang: string; proficiency: string }[]
  certifications: string[]
  teaching_bio: string | null
  intro_video_url: string | null
  timezone: string | null
  availability: string[]
}

type TeacherWithApplication = {
  id: string
  name: string
  bio: string | null
  created_at: string
  groups: { id: string; status: string; courses: { name: string } | null }[]
  teacher_applications: ApplicationRow | null
}

export default async function AdminTeachersPage() {
  // Use service-role client so we can read all teacher_applications past RLS
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: teachersRaw } = await (admin as any)
    .from('profiles')
    .select(`
      id, name, bio, created_at,
      groups:groups(id, status, courses(name)),
      teacher_applications(status, submitted_at, admin_notes, languages_taught, certifications, teaching_bio, intro_video_url, timezone, availability)
    `)
    .eq('role', 'teacher')
    .order('created_at', { ascending: false })

  // teacher_applications is 1-to-1 (unique user_id) but Supabase returns array
  const teachers: TeacherWithApplication[] = (teachersRaw ?? []).map(
    (t: TeacherWithApplication & { teacher_applications: ApplicationRow[] | ApplicationRow | null }) => ({
      ...t,
      teacher_applications: Array.isArray(t.teacher_applications)
        ? (t.teacher_applications[0] ?? null)
        : t.teacher_applications,
    })
  )

  return <TeachersClient teachers={teachers} />
}
