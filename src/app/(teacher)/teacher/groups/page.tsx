import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GroupsClient } from './GroupsClient'
import type { Group, Course, GroupMember, Profile, Session } from '@/lib/supabase/types'

type GroupRow = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
  group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null })[]
}
type SessionSlim = Pick<Session, 'id' | 'group_id' | 'room_token' | 'scheduled_at' | 'status'>

export default async function TeacherGroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: groupsRaw } = await supabase
    .from('groups')
    .select('*, courses(name, language, level, sessions_per_week, duration_weeks), group_members(*, profiles:user_id(id, name, avatar_url))')
    .eq('teacher_id', user.id)
    .neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')
    .order('created_at', { ascending: false })

  const groups = (groupsRaw ?? []) as unknown as GroupRow[]
  const groupIds = groups.map(g => g.id)

  let nextByGroup: Record<string, SessionSlim> = {}
  let completedCountByGroup: Record<string, number> = {}

  if (groupIds.length > 0) {
    const { data: upcomingRaw } = await supabase
      .from('sessions')
      .select('id, group_id, room_token, scheduled_at, status')
      .in('group_id', groupIds)
      .in('status', ['scheduled', 'active'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    nextByGroup = ((upcomingRaw ?? []) as unknown as SessionSlim[]).reduce<Record<string, SessionSlim>>((acc, s) => {
      if (!acc[s.group_id]) acc[s.group_id] = s
      return acc
    }, {})

    const { data: doneRaw } = await supabase
      .from('sessions')
      .select('group_id')
      .in('group_id', groupIds)
      .eq('status', 'completed')

    completedCountByGroup = ((doneRaw ?? []) as { group_id: string }[]).reduce<Record<string, number>>((acc, s) => {
      acc[s.group_id] = (acc[s.group_id] ?? 0) + 1
      return acc
    }, {})
  }

  const serialized = groups.map(g => ({
    id: g.id,
    week_start: g.week_start,
    status: g.status,
    courses: g.courses ? {
      name: g.courses.name,
      language: g.courses.language,
      level: g.courses.level,
      sessions_per_week: g.courses.sessions_per_week,
      duration_weeks: g.courses.duration_weeks,
    } : null,
    group_members: g.group_members.map(m => ({
      id: m.id,
      profiles: m.profiles ? { id: m.profiles.id, name: m.profiles.name } : null,
    })),
    next_session: nextByGroup[g.id] ? {
      id: nextByGroup[g.id].id,
      group_id: nextByGroup[g.id].group_id,
      room_token: nextByGroup[g.id].room_token,
      scheduled_at: nextByGroup[g.id].scheduled_at,
      status: nextByGroup[g.id].status,
    } : null,
    done_count: completedCountByGroup[g.id] ?? 0,
  }))

  return <GroupsClient groups={serialized} />
}
