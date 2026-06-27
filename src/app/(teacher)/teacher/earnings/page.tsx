import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EarningsClient } from './EarningsClient'

// Teachers earn a share of each course they teach. A course's fee becomes
// withdrawable only once that course (group) is completed; until then it shows
// as pending. Per-session charging has been removed.
export const TEACHER_COURSE_SHARE = 0.70

export default async function EarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Groups this teacher runs (each ties a course to a cohort of students)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: groupsRaw } = await (supabase as any)
    .from('groups')
    .select('id, status, week_start, course_id, courses(name, language, price_pkr, duration_weeks, sessions_per_week), group_members(user_id)')
    .eq('teacher_id', user.id)
    .neq('acceptance_status', 'pending_teacher')
    .neq('acceptance_status', 'declined')
    .order('week_start', { ascending: false })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groups = (groupsRaw ?? []) as any[]
  const groupIds = groups.map(g => g.id)

  // 2. Completed-session counts per group (used to detect course completion)
  const completedByGroup = new Map<string, number>()
  if (groupIds.length > 0) {
    const { data: sess } = await supabase
      .from('sessions').select('group_id').eq('status', 'completed').in('group_id', groupIds)
    for (const s of (sess ?? []) as { group_id: string }[]) {
      completedByGroup.set(s.group_id, (completedByGroup.get(s.group_id) ?? 0) + 1)
    }
  }

  // 3. Which (student, course) pairs have completed payment
  const memberIds = [...new Set(groups.flatMap(g => (g.group_members ?? []).map((m: { user_id: string }) => m.user_id)))]
  const courseIds = [...new Set(groups.map(g => g.course_id))]
  const paidSet = new Set<string>()
  if (memberIds.length > 0 && courseIds.length > 0) {
    const { data: enr } = await supabase
      .from('enrollments').select('user_id, course_id')
      .eq('payment_status', 'paid')
      .in('user_id', memberIds as string[])
      .in('course_id', courseIds as string[])
    for (const e of (enr ?? []) as { user_id: string; course_id: string }[]) {
      paidSet.add(`${e.user_id}|${e.course_id}`)
    }
  }

  // 4. Build per-course earnings
  const courseEarnings = groups.map(g => {
    const course = g.courses
    const price = Number(course?.price_pkr ?? 0)
    const sharePerStudent = Math.round(price * TEACHER_COURSE_SHARE)
    const members = (g.group_members ?? []) as { user_id: string }[]
    const paidStudents = members.filter(m => paidSet.has(`${m.user_id}|${g.course_id}`)).length
    const totalSessions = (course?.sessions_per_week ?? 0) * (course?.duration_weeks ?? 0)
    const completedSessions = completedByGroup.get(g.id) ?? 0
    const completed = g.status === 'completed' || (totalSessions > 0 && completedSessions >= totalSessions)
    return {
      groupId: g.id,
      courseName: course?.name ?? 'Course',
      language: course?.language ?? '',
      price,
      sharePerStudent,
      paidStudents,
      earning: paidStudents * sharePerStudent,
      completed,
      completedSessions,
      totalSessions,
    }
  })

  // 5. Payout history
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: payoutsRaw } = await (supabase as any)
    .from('teacher_payouts')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  const payouts = (payoutsRaw ?? []) as {
    id: string; amount: number; status: string; payout_date: string | null;
    method: string | null; created_at: string
  }[]

  // 6. Totals
  const earnedCompleted = courseEarnings.filter(c => c.completed).reduce((a, c) => a + c.earning, 0)
  const pendingTotal = courseEarnings.filter(c => !c.completed).reduce((a, c) => a + c.earning, 0)
  const totalPaid = payouts.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)
  const pendingPayouts = payouts.filter(p => p.status === 'pending' || p.status === 'processing').reduce((a, p) => a + p.amount, 0)
  const available = Math.max(0, earnedCompleted - totalPaid - pendingPayouts)

  return (
    <EarningsClient
      courses={courseEarnings}
      payouts={payouts}
      pendingTotal={pendingTotal}
      earnedTotal={earnedCompleted}
      totalPaid={totalPaid}
      available={available}
    />
  )
}
