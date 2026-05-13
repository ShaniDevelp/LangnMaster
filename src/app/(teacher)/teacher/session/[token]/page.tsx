import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { TeacherLobby } from '@/components/TeacherLobby'
import type { Session, Group, Course, Profile, GroupMember } from '@/lib/supabase/types'

type SessionWithGroup = Session & {
  topic?: string
  prep_notes?: string
  groups: (Group & {
    week_start?: string | null
    courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
    group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name'> | null })[]
  }) | null
}

export default async function TeacherSessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessionRaw } = await (supabase as any)
    .from('sessions')
    .select('*, groups(*, week_start, courses(name, language, level, sessions_per_week, duration_weeks), profiles:teacher_id(id, name), group_members(*, profiles:user_id(id, name)))')
    .eq('room_token', token)
    .single()

  if (!sessionRaw) notFound()
  const session = sessionRaw as unknown as SessionWithGroup

  // Only the assigned teacher can access this lobby
  if (session.groups?.teacher_id !== user.id) redirect('/teacher/dashboard')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null

  const students = (session.groups?.group_members ?? [])
    .map(m => ({ id: m.profiles?.id ?? '', name: m.profiles?.name ?? 'Student' }))
    .filter(s => s.id)

  const weekStart = session.groups?.week_start ?? null
  const currentWeek = weekStart
    ? Math.max(1, Math.floor((Date.now() - new Date(weekStart).getTime()) / (7 * 86_400_000)) + 1)
    : 1

  const groupId = session.group_id
  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .lte('scheduled_at', session.scheduled_at)

  const sessionNumber = sessionCount ?? 1
  const totalSessions = (session.groups?.courses?.sessions_per_week ?? 1) * (session.groups?.courses?.duration_weeks ?? 1)

  return (
    <TeacherLobby
      sessionId={session.id}
      roomToken={token}
      courseName={session.groups?.courses?.name ?? 'Session'}
      language={session.groups?.courses?.language ?? ''}
      level={session.groups?.courses?.level ?? ''}
      scheduledAt={session.scheduled_at}
      userId={user.id}
      userName={profile?.name ?? 'Teacher'}
      students={students}
      weekNumber={currentWeek}
      sessionNumber={sessionNumber}
      totalSessions={totalSessions}
      existingTopic={(session as unknown as Record<string, string>).topic ?? ''}
      existingPrepNotes={(session as unknown as Record<string, string>).prep_notes ?? ''}
    />
  )
}
