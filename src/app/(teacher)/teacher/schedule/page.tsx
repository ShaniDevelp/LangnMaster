import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Group, Course, GroupMember, Session } from '@/lib/supabase/types'
import { ScheduleClient } from './ScheduleClient'

type SessionRow = Session & {
  topic?: string | null
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    group_members: Pick<GroupMember, 'id'>[]
  }) | null
}

export default async function TeacherSchedulePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profileRaw } = await supabase.from('profiles').select('timezone').eq('id', user.id).single()
  const timezone = (profileRaw as { timezone: string | null } | null)?.timezone ?? ''

  // All groups for this teacher
  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('id')
    .eq('teacher_id', user.id)

  const groupIds = ((groupsRaw ?? []) as { id: string }[]).map(g => g.id)

  // Sessions spanning ± 8 weeks
  const past = new Date(); past.setDate(past.getDate() - 56)
  const future = new Date(); future.setDate(future.getDate() + 56)

  let sessions: SessionRow[] = []
  if (groupIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('sessions')
      .select('*, groups(*, courses(name, language), group_members(id))')
      .in('group_id', groupIds)
      .gte('scheduled_at', past.toISOString())
      .lte('scheduled_at', future.toISOString())
      .order('scheduled_at', { ascending: true })
    sessions = (data ?? []) as SessionRow[]
  }

  // Unavailability dates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: unavailRaw } = await (supabase as any)
    .from('teacher_unavailability')
    .select('date')
    .eq('teacher_id', user.id)

  const unavailDates = ((unavailRaw ?? []) as { date: string }[]).map(r => r.date)

  const sessionsSerialized = sessions.map(s => ({
    id: s.id,
    group_id: s.group_id,
    room_token: s.room_token,
    scheduled_at: s.scheduled_at,
    duration_minutes: s.duration_minutes,
    status: s.status,
    topic: (s as Record<string, unknown>).topic as string | null,
    course_name: s.groups?.courses?.name ?? 'Session',
    language: s.groups?.courses?.language ?? '',
    student_count: s.groups?.group_members?.length ?? 0,
  }))

  return (
    <ScheduleClient
      sessions={sessionsSerialized}
      unavailDates={unavailDates}
      teacherTimezone={timezone}
    />
  )
}
