import { createClient } from '@/lib/supabase/server'
import type { Profile, Enrollment, Course } from '@/lib/supabase/types'
import { GroupBuilder } from './GroupBuilder'
import { SuggestionsReview } from './SuggestionsReview'
import { PendingTeacherGroups, type PendingTeacherGroupRow } from './PendingTeacherGroups'
import { DeclinedAlerts, type DeclinedAlertRow } from './DeclinedAlerts'
import { suggestGroupAssignments } from '@/lib/admin/actions'

type EnrollmentRow = Enrollment & {
  profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
  courses: Pick<Course, 'id' | 'name' | 'language' | 'level' | 'max_group_size' | 'sessions_per_week' | 'duration_weeks'> | null
}

type TeacherData = {
  id: string
  name: string
  avatar_url: string | null
  availability: string[]
  languages_taught: { lang: string; proficiency: string }[]
  approvedCourseIds: string[]
  activeGroupCount: number
  occupiedSlots: string[]
}

const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch Enrollments
  const { data: enrollmentsRaw } = await supabase
    .from('enrollments')
    .select('*, profiles:user_id(id, name, avatar_url, availability), courses(id, name, language, level, max_group_size, sessions_per_week, duration_weeks)')
    .order('enrolled_at', { ascending: false })

  const enrollments = (enrollmentsRaw ?? []) as unknown as EnrollmentRow[]
  const pending = enrollments.filter(e => e.status === 'pending')

  // 2. Fetch Teachers for the Group Builder
  const { data: teachersRaw } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, availability, languages_taught')
    .eq('role', 'teacher')

  // 2a. Fetch approved course assignments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: approvalsRaw } = await (supabase as any)
    .from('course_teachers')
    .select('teacher_id, course_id')
    .eq('status', 'approved')

  const approvalsByTeacher = new Map<string, string[]>()
  for (const row of (approvalsRaw ?? []) as { teacher_id: string; course_id: string }[]) {
    const existing = approvalsByTeacher.get(row.teacher_id) ?? []
    existing.push(row.course_id)
    approvalsByTeacher.set(row.teacher_id, existing)
  }

  // 2b. Active group count per teacher
  const { data: activeGroupsRaw } = await supabase
    .from('groups')
    .select('teacher_id')
    .eq('status', 'active')

  const loadByTeacher = new Map<string, number>()
  for (const row of (activeGroupsRaw ?? []) as { teacher_id: string | null }[]) {
    if (!row.teacher_id) continue
    loadByTeacher.set(row.teacher_id, (loadByTeacher.get(row.teacher_id) ?? 0) + 1)
  }

  // teachers array built after occupiedSlotsByTeacher is computed (see below)

  // 3. Smart suggestions for pending enrollments
  const { proposals = [] } = await suggestGroupAssignments()

  // 4. Groups awaiting teacher acceptance OR declined (need reassignment)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pendingGroupsRaw } = await (supabase as any)
    .from('groups')
    .select(`
      id, proposed_at, teacher_id, acceptance_status, declined_teachers, course_id,
      courses(id, name, language, level, sessions_per_week, duration_weeks),
      group_members(user_id, profiles:user_id(name, avatar_url, availability))
    `)
    .in('acceptance_status', ['pending_teacher', 'declined'])
    .order('proposed_at', { ascending: false })

  // Fetch teacher names for all proposal groups
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingGroupsTyped = (pendingGroupsRaw ?? []) as any[]
  const teacherIds = [...new Set(pendingGroupsTyped.map((g: { teacher_id: string }) => g.teacher_id).filter(Boolean))]
  const { data: teacherProfilesRaw } = teacherIds.length > 0
    ? await supabase.from('profiles').select('id, name').in('id', teacherIds)
    : { data: [] }

  const teacherNameById = new Map<string, string>()
  for (const t of (teacherProfilesRaw ?? []) as { id: string; name: string }[]) {
    teacherNameById.set(t.id, t.name)
  }

  // Count sessions per group
  const pendingGroupIds = pendingGroupsTyped.map((g: { id: string }) => g.id)
  const { data: sessionCountsRaw } = pendingGroupIds.length > 0
    ? await supabase.from('sessions').select('group_id').in('group_id', pendingGroupIds)
    : { data: [] }

  const sessionCountByGroup = new Map<string, number>()
  for (const s of (sessionCountsRaw ?? []) as { group_id: string }[]) {
    sessionCountByGroup.set(s.group_id, (sessionCountByGroup.get(s.group_id) ?? 0) + 1)
  }

  // For declined groups: compute eligible teachers (approved for course, not in declined_teachers)
  const declinedGroups = pendingGroupsTyped.filter(g => g.acceptance_status === 'declined')
  const courseIdsForDeclined = [...new Set(declinedGroups.map((g: { course_id: string }) => g.course_id))]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: approvalsForDeclinedRaw } = courseIdsForDeclined.length > 0 ? await (supabase as any)
    .from('course_teachers')
    .select('teacher_id, course_id, profiles:teacher_id(id, name, availability)')
    .eq('status', 'approved')
    .in('course_id', courseIdsForDeclined)
    : { data: [] }

  // Map: course_id -> approved teachers (id + name + availability + load)
  const approvedTeachersByCourse = new Map<string, Array<{ id: string; name: string; activeGroupCount: number; availability: string[] }>>()
  for (const row of (approvalsForDeclinedRaw ?? []) as { teacher_id: string; course_id: string; profiles: { id: string; name: string; availability: string[] | null } | null }[]) {
    if (!row.profiles) continue
    const list = approvedTeachersByCourse.get(row.course_id) ?? []
    list.push({
      id: row.profiles.id,
      name: row.profiles.name,
      activeGroupCount: loadByTeacher.get(row.profiles.id) ?? 0,
      availability: row.profiles.availability ?? [],
    })
    approvedTeachersByCourse.set(row.course_id, list)
  }

  // Compute which UTC slots each teacher already has booked in other active groups
  // Covers both: declined-eligible teachers (for reassignment) + all main teachers (for GroupBuilder Step 3)
  const allEligibleTeacherIds = [...new Set([
    ...[...approvedTeachersByCourse.values()].flatMap(ts => ts.map(t => t.id)),
    ...((teachersRaw ?? []) as { id: string }[]).map(t => t.id),
  ])]
  const occupiedSlotsByTeacher = new Map<string, Set<string>>()

  if (allEligibleTeacherIds.length > 0) {
    const { data: teacherGroupsRaw } = await supabase
      .from('groups')
      .select('id, teacher_id')
      .in('teacher_id', allEligibleTeacherIds)
      .neq('acceptance_status', 'pending_teacher')
      .neq('acceptance_status', 'declined')

    const tGroupIds = ((teacherGroupsRaw ?? []) as { id: string; teacher_id: string }[]).map(g => g.id)
    const groupToTeacher = new Map<string, string>()
    for (const g of (teacherGroupsRaw ?? []) as { id: string; teacher_id: string }[]) {
      groupToTeacher.set(g.id, g.teacher_id)
    }

    if (tGroupIds.length > 0) {
      const { data: tSessionsRaw } = await supabase
        .from('sessions')
        .select('group_id, scheduled_at')
        .in('group_id', tGroupIds)
        .in('status', ['scheduled', 'active'])
        .gte('scheduled_at', new Date().toISOString())

      for (const s of (tSessionsRaw ?? []) as { group_id: string; scheduled_at: string }[]) {
        const teacherId = groupToTeacher.get(s.group_id)
        if (!teacherId) continue
        const d = new Date(s.scheduled_at)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const slot = `${days[d.getUTCDay()]}-${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
        const set = occupiedSlotsByTeacher.get(teacherId) ?? new Set<string>()
        set.add(slot)
        occupiedSlotsByTeacher.set(teacherId, set)
      }
    }
  }

  const teachers: TeacherData[] = ((teachersRaw ?? []) as { id: string; name: string; avatar_url: string | null; availability: string[] | null; languages_taught: { lang: string; proficiency: string }[] | null }[]).map(t => ({
    id: t.id,
    name: t.name,
    avatar_url: t.avatar_url,
    availability: t.availability ?? [],
    languages_taught: t.languages_taught ?? [],
    approvedCourseIds: approvalsByTeacher.get(t.id) ?? [],
    activeGroupCount: loadByTeacher.get(t.id) ?? 0,
    occupiedSlots: [...(occupiedSlotsByTeacher.get(t.id) ?? [])],
  }))

  const pendingTeacherGroups: PendingTeacherGroupRow[] = pendingGroupsTyped.map(g => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const declinedTeachers: any[] = Array.isArray(g.declined_teachers) ? g.declined_teachers : []
    const declinedIds = new Set(declinedTeachers.map((d: { teacher_id: string }) => d.teacher_id))

    const eligibleTeachers = g.acceptance_status === 'declined'
      ? (approvedTeachersByCourse.get(g.course_id) ?? []).filter(t => !declinedIds.has(t.id)).map(t => ({
          ...t,
          occupiedSlots: [...(occupiedSlotsByTeacher.get(t.id) ?? [])],
        }))
      : []

    return {
      id: g.id,
      proposed_at: g.proposed_at,
      acceptance_status: g.acceptance_status as 'pending_teacher' | 'declined',
      course_id: g.course_id,
      course_name: g.courses?.name ?? 'Unknown Course',
      course_language: g.courses?.language ?? '',
      course_level: g.courses?.level ?? '',
      sessions_per_week: g.courses?.sessions_per_week ?? 1,
      teacher_id: g.teacher_id,
      teacher_name: teacherNameById.get(g.teacher_id) ?? 'Unknown Teacher',
      members: (g.group_members ?? []).map((m: { user_id: string; profiles: { name: string; avatar_url: string | null; availability: string[] | null } | null }) => ({
        user_id: m.user_id,
        name: m.profiles?.name ?? 'Student',
        avatar_url: m.profiles?.avatar_url ?? null,
        availability: m.profiles?.availability ?? [],
      })),
      session_count: sessionCountByGroup.get(g.id) ?? 0,
      declined_teachers: declinedTeachers,
      eligible_teachers: eligibleTeachers,
    }
  })

  // 5. Dismissed declined-notification tracking (still useful for real-time bell)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: declinedRaw } = user ? await (supabase as any)
    .from('notifications')
    .select('id, created_at, payload')
    .eq('user_id', user.id)
    .eq('type', 'group_proposal_declined')
    .is('read_at', null)
    .order('created_at', { ascending: false })
    : { data: [] }

  const declinedAlerts: DeclinedAlertRow[] = (declinedRaw ?? []) as DeclinedAlertRow[]

  // Users already covered by a pending proposal — exclude from builder + suggestions
  const usersInPendingProposal = new Set<string>()
  for (const g of pendingTeacherGroups) {
    for (const m of g.members) usersInPendingProposal.add(m.user_id)
  }

  // Pending enrollments whose students have no proposal sent yet
  const availablePending = pending.filter(e => !usersInPendingProposal.has(e.user_id))

  // Proposals that contain only students not already in a pending proposal
  const availableProposals = proposals.filter(p =>
    p.enrollments.every(e => !usersInPendingProposal.has(e.userId))
  )

  const inProposalCount = pending.length - availablePending.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments & Group Builder</h1>
          <p className="text-gray-500 text-sm mt-1">
            {enrollments.length} total · {availablePending.length} need assignment
            {inProposalCount > 0 && ` · ${inProposalCount} awaiting teacher response`}
          </p>
        </div>
      </div>

      {/* Declined proposal alerts */}
      {declinedAlerts.length > 0 && <DeclinedAlerts alerts={declinedAlerts} />}

      {/* Groups waiting for teacher acceptance */}
      {pendingTeacherGroups.length > 0 && <PendingTeacherGroups groups={pendingTeacherGroups} />}

      {/* Smart suggestions + Group Builder — only for students not already in a pending proposal */}
      {availablePending.length > 0 && (
        <>
          {availableProposals.length > 0 && <SuggestionsReview proposals={availableProposals} />}
          <GroupBuilder pending={availablePending} teachers={teachers} />
        </>
      )}

      {/* Full enrollment table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">All Enrollments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Course</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Enrolled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {enrollments.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {e.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <span className="font-medium text-gray-900">{e.profiles?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{e.courses?.name}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[e.status]}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-400 text-xs">
                    {new Date(e.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">No enrollments yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
