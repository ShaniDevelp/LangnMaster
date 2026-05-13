import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SessionRoom from '@/components/SessionRoom'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type FullSession = Session & {
  groups: (Group & {
    courses: Pick<Course, 'id' | 'name' | 'language' | 'sessions_per_week' | 'duration_weeks'> | null
    profiles: Pick<Profile, 'id' | 'name'> | null
  }) | null
}

type ModuleRow = { week_number: number; title: string }
type MemberRow = { user_id: string; profiles: Pick<Profile, 'name'> | null }
type NextRow = Pick<Session, 'scheduled_at' | 'room_token'>

export default async function StudentSessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessionRaw } = await supabase
    .from('sessions')
    .select('*, groups(*, courses(id, name, language, sessions_per_week, duration_weeks), profiles:teacher_id(id, name))')
    .eq('room_token', token)
    .single()

  if (!sessionRaw) notFound()
  const session = sessionRaw as unknown as FullSession

  // Verify membership
  const { data: membershipRaw } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', session.group_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membershipRaw) redirect('/student/sessions')

  const { data: profileRaw } = await supabase.from('profiles').select('name').eq('id', user.id).single()
  const myName = (profileRaw as { name?: string } | null)?.name ?? 'Student'

  const group = session.groups
  const course = group?.courses ?? null
  const teacher = group?.profiles ?? null

  // Parallel: partner + week module + next session
  const groupId = session.group_id
  const courseId = course?.id ?? ''

  const weekStart = (group as unknown as { week_start?: string } | null)?.week_start ?? null
  const nowMs = new Date().getTime()
  const currentWeek = weekStart
    ? Math.max(1, Math.floor((nowMs - new Date(weekStart).getTime()) / (7 * 86_400_000)) + 1)
    : 1

  const [partnersRes, moduleRes, nextRes, sessionIndexRes] = await Promise.all([
    supabase
      .from('group_members')
      .select('user_id, profiles(name)')
      .eq('group_id', groupId)
      .neq('user_id', user.id),
    courseId
      ? supabase
          .from('course_modules')
          .select('week_number, title')
          .eq('course_id', courseId)
          .eq('week_number', currentWeek)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('sessions')
      .select('scheduled_at, room_token')
      .eq('group_id', groupId)
      .eq('status', 'scheduled')
      .gt('scheduled_at', session.scheduled_at)
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .lte('scheduled_at', session.scheduled_at),
  ])

  const members = (partnersRes.data ?? []) as unknown as MemberRow[]
  // Partner is the non-teacher member
  const partnerMember = members.find(m => m.user_id !== teacher?.id)
  const partnerName = partnerMember?.profiles?.name ?? null

  const weekModule = moduleRes.data as ModuleRow | null
  const nextSession = nextRes.data as NextRow | null
  const sessionNumber = sessionIndexRes.count ?? 1
  const totalSessions = (course?.sessions_per_week ?? 1) * (course?.duration_weeks ?? 1)

  return (
    <SessionRoom
      roomToken={token}
      sessionId={session.id}
      userId={user.id}
      userName={myName}
      courseName={course?.name ?? 'Session'}
      courseId={courseId}
      teacherId={group?.teacher_id ?? null}
      teacherName={teacher?.name ?? null}
      partnerName={partnerName}
      scheduledAt={session.scheduled_at}
      durationMinutes={session.duration_minutes}
      prepNotes={session.notes}
      weekNumber={currentWeek}
      weekTopic={weekModule?.title ?? null}
      nextSessionAt={nextSession?.scheduled_at ?? null}
      nextSessionToken={nextSession?.room_token ?? null}
      sessionNumber={sessionNumber}
      totalSessions={totalSessions}
    />
  )
}
