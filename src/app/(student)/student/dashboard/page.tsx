import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Course, Enrollment, Session, Group, Profile } from '@/lib/supabase/types'
import { activePeriodsLocal, DAYS as AVAIL_DAYS, PERIOD_LABEL } from '@/lib/availability'
import { MessageButton } from '@/components/MessageButton'
import { CourseBannerBg } from '@/components/CourseBanner'

// ── Types ─────────────────────────────────────────────────────────────────────

type EnrollmentRow = Enrollment & { courses: Course | null }
type SessionRow = Session & {
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    profiles: Pick<Profile, 'name'> | null
  }) | null
}
type TeacherRow = {
  teacher_id: string
  profiles: Pick<Profile, 'id' | 'name' | 'bio' | 'avatar_url'> & {
    years_experience?: number
    languages_taught?: { lang: string; proficiency: string }[]
    rating?: number
  } | null
}
type GroupDetailRow = {
  id: string
  course_id: string
  teacher_id: string | null
  week_start: string
  status: string
  courses: Pick<Course, 'name' | 'language' | 'sessions_per_week' | 'duration_weeks'> | null
  profiles: Pick<Profile, 'id' | 'name' | 'bio' | 'avatar_url'> & {
    years_experience?: number
    rating?: number
    languages_taught?: { lang: string; proficiency: string }[]
  } | null
}
// ── Static config ─────────────────────────────────────────────────────────────

const LANG_EMOJI: Record<string, string> = {
  English: '🇬🇧', Spanish: '🇪🇸', French: '🇫🇷',
  German: '🇩🇪', Mandarin: '🇨🇳', Japanese: '🇯🇵',
}
const STATUS_STYLE: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  assigned:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
}
const AVATAR_GRADS = [
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
]
const SLOT_LABELS: Record<string, string> = {
  morning: '6 am – 12 pm',
  afternoon: '12 pm – 6 pm',
  evening: '6 pm – 11 pm',
}
const DAY_LABELS: Record<string, string> = {
  mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu',
  fri: 'Fri', sat: 'Sat', sun: 'Sun',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextMondayLabel() {
  const today = new Date()
  const day = today.getDay()
  const daysUntil = day === 1 ? 7 : day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysUntil)
  return monday.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function daysUntilMonday(): number {
  const day = new Date().getDay()
  return day === 1 ? 7 : day === 0 ? 1 : 8 - day
}

function refundDaysLeft(enrolledAt: string): number {
  const deadline = new Date(enrolledAt)
  deadline.setDate(deadline.getDate() + 7)
  return Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86_400_000))
}

function greeting_word() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function slotsFromAvailability(availability: string[] | null, timezone: string | null): { day: string; slot: string }[] {
  if (!availability?.length) return []
  const tzone = timezone || 'UTC'
  const activeSet = activePeriodsLocal(availability, tzone)
  const results: { day: string; slot: string }[] = []

  // Iterate in DAYS order to keep it sorted
  for (const day of AVAIL_DAYS) {
    for (const period of ['morning', 'afternoon', 'evening'] as const) {
      if (activeSet.has(`${day}-${period}`)) {
        results.push({
          day: day,
          slot: PERIOD_LABEL[period].split('  ')[1] || PERIOD_LABEL[period]
        })
      }
    }
  }
  return results
}

function currentWeekNumber(weekStart: string): number {
  const start = new Date(weekStart).getTime()
  const diff = Date.now() - start
  if (diff < 0) return 1
  return Math.min(Math.floor(diff / (7 * 86_400_000)) + 1, 99)
}

function timeUntilStr(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff < 0) return 'Now'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 48) return `${Math.floor(h / 24)}d away`
  if (h > 0)  return `${h}h ${m}m`
  return `${m}m`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // These three only depend on the user — fetch them together instead of in a
  // sequential waterfall (saves two cross-region round trips per navigation).
  const [profileRes, memberGroupsRes, enrollmentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('group_members').select('group_id').eq('user_id', user.id),
    supabase.from('enrollments').select('*, courses(*)').eq('user_id', user.id).order('enrolled_at', { ascending: false }),
  ])

  const profile = profileRes.data as (Profile & { availability?: string[] | null; timezone?: string | null }) | null

  const allGroupIds = ((memberGroupsRes.data ?? []) as { group_id: string }[]).map(m => m.group_id)

  // Exclude groups still pending teacher acceptance — student shouldn't see them yet
  const { data: acceptedGroupsRaw } = allGroupIds.length > 0
    ? await supabase.from('groups').select('id').in('id', allGroupIds).neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')
    : { data: [] }
  const groupIds = ((acceptedGroupsRaw ?? []) as { id: string }[]).map(g => g.id)

  let upcomingSessions: SessionRow[] = []
  let completedCount = 0
  let missedSessions: SessionRow[] = []
  let activeGroups: GroupDetailRow[] = []
  const completedByGroup: Record<string, number> = {}
  const partnersByGroup: Record<string, string[]> = {}

  if (groupIds.length > 0) {
    const nowIso = new Date().toISOString()
    const [sessionsRes, completedRes, missedRes, activeGroupsRes, completedRowsRes, membersRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('*, groups(*, courses(name, language), profiles:teacher_id(name))')
        .in('group_id', groupIds)
        .in('status', ['scheduled', 'active'])
        .gte('scheduled_at', nowIso)
        .order('scheduled_at', { ascending: true })
        .limit(12),
      supabase
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .in('group_id', groupIds)
        .eq('status', 'completed'),
      supabase
        .from('sessions')
        .select('*, groups(*, courses(name, language), profiles:teacher_id(name))')
        .in('group_id', groupIds)
        .eq('status', 'scheduled')
        .lt('scheduled_at', nowIso)
        .order('scheduled_at', { ascending: false })
        .limit(5),
      // All active groups — one progress card per course
      supabase
        .from('groups')
        .select('id, course_id, teacher_id, week_start, status, courses(name, language, sessions_per_week, duration_weeks), profiles:teacher_id(id, name, bio, avatar_url, years_experience, rating, languages_taught)')
        .in('id', groupIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      // Completed sessions tallied per group for per-course progress
      supabase
        .from('sessions')
        .select('group_id')
        .in('group_id', groupIds)
        .eq('status', 'completed'),
      // All group members for classmate names per group
      supabase
        .from('group_members')
        .select('group_id, user_id, profiles(id, name, avatar_url)')
        .in('group_id', groupIds),
    ])

    upcomingSessions = (sessionsRes.data ?? []) as unknown as SessionRow[]
    completedCount = completedRes.count ?? 0
    missedSessions = (missedRes.data ?? []) as unknown as SessionRow[]
    activeGroups = (activeGroupsRes.data ?? []) as unknown as GroupDetailRow[]

    for (const r of (completedRowsRes.data ?? []) as { group_id: string }[]) {
      completedByGroup[r.group_id] = (completedByGroup[r.group_id] ?? 0) + 1
    }
    for (const m of (membersRes.data ?? []) as unknown as { group_id: string; user_id: string; profiles: { name: string | null } | null }[]) {
      if (m.user_id === user.id) continue
      ;(partnersByGroup[m.group_id] ??= []).push(m.profiles?.name?.split(' ')[0] ?? 'Classmate')
    }
  }

  const enrollments = (enrollmentsRes.data ?? []) as unknown as EnrollmentRow[]

  const pendingEnrollments = enrollments.filter(e => e.status === 'pending')
  const hasPending = pendingEnrollments.length > 0
  const nextSession = upcomingSessions[0]

  // Unpaid enrolled students who have been assigned a group → prompt payment
  const unpaidAssignedEnrollments = enrollments.filter(
    e => e.payment_status === 'unpaid' && (e.status === 'assigned' || e.status === 'active')
  )
  const hasUnpaidSessions = unpaidAssignedEnrollments.length > 0

  // Per-course payment gate — a session is locked ONLY if ITS OWN course is
  // unpaid. Previously the lock was global, so paying for course 1 still showed
  // its sessions locked whenever an unrelated course 2 was unpaid.
  const unpaidCourseIds = new Set(unpaidAssignedEnrollments.map(e => e.course_id))

  // Per-course progress — one summary per active group so each course's
  // progress is shown separately on the dashboard.
  const activeCourses = activeGroups.map(g => {
    const c = g.courses as { name?: string; language?: string; sessions_per_week?: number; duration_weeks?: number } | null
    const totalWeeks = c?.duration_weeks ?? 0
    return {
      groupId: g.id,
      courseId: g.course_id,
      name: c?.name ?? 'Course',
      language: c?.language ?? '',
      teacherId: g.teacher_id,
      teacherName: g.profiles?.name ?? 'Your teacher',
      teacherAvatar: g.profiles?.avatar_url ?? null,
      week: currentWeekNumber(g.week_start),
      totalWeeks,
      done: completedByGroup[g.id] ?? 0,
      total: totalWeeks * (c?.sessions_per_week ?? 0),
      partners: partnersByGroup[g.id] ?? [],
      isUnpaid: unpaidCourseIds.has(g.course_id),
    }
  })

  const nextSessionCourseId = nextSession?.groups?.course_id
  const nextSessionUnpaid = nextSessionCourseId ? unpaidCourseIds.has(nextSessionCourseId) : false

  // Fetch teacher pool for pending courses
  let pendingTeachers: TeacherRow[] = []
  if (hasPending) {
    const pendingCourseIds = pendingEnrollments.map(e => e.course_id).filter(Boolean)
    if (pendingCourseIds.length > 0) {
      const { data } = await supabase
        .from('course_teachers')
        .select('teacher_id, profiles!course_teachers_teacher_id_fkey(id, name, bio, avatar_url, years_experience, languages_taught, rating)')
        .in('course_id', pendingCourseIds)
        .limit(4)
      pendingTeachers = (data ?? []) as unknown as TeacherRow[]
    }
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'there'
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const monday = nextMondayLabel()
  const daysToMonday = daysUntilMonday()
  const slots = slotsFromAvailability(profile?.availability ?? null, profile?.timezone ?? null)
  const earliestPending = pendingEnrollments[0]
  const refundLeft = earliestPending ? refundDaysLeft(earliestPending.enrolled_at) : 0

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900 truncate">
            {greeting_word()}, {firstName} 👋
          </h1>
          <p className="text-gray-400 text-xs lg:text-sm mt-0.5">{todayLabel}</p>
        </div>
        <Link
          href="/student/courses"
          className="flex-shrink-0 inline-flex items-center gap-2 text-xs lg:text-sm font-semibold bg-brand-500 text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl hover:bg-brand-600 transition-colors shadow-sm"
        >
          <span className="hidden sm:inline">Browse courses</span>
          <span className="sm:hidden">Browse</span> →
        </Link>
      </div>

      {/* ── Unpaid sessions payment prompt ──────────────────────── */}
      {hasUnpaidSessions && (
        <div className="bg-orange-50 border border-orange-300 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">💳</span>
            <div className="min-w-0">
              <p className="font-semibold text-orange-900 text-sm">
                Your group{unpaidAssignedEnrollments.length > 1 ? 's are' : ' is'} assigned — pay to unlock sessions
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                {unpaidAssignedEnrollments.map(e => e.courses?.name).filter(Boolean).join(', ')} —
                complete payment to join your live sessions.
              </p>
            </div>
          </div>
          <Link
            href={`/student/courses/${unpaidAssignedEnrollments[0]?.course_id}/checkout`}
            className="flex-shrink-0 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Pay now →
          </Link>
        </div>
      )}

      {/* ── Missed sessions alert ──────────────────────────────── */}
      {missedSessions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="min-w-0">
              <p className="font-semibold text-amber-800 text-sm">
                {missedSessions.length} session{missedSessions.length > 1 ? 's were' : ' was'} missed
              </p>
              <p className="text-xs text-amber-700 mt-0.5 line-clamp-2">
                {missedSessions.length === 1
                  ? `"${missedSessions[0].groups?.courses?.name}" on ${new Date(missedSessions[0].scheduled_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} passed without being completed.`
                  : `${missedSessions.map(s => s.groups?.courses?.name).filter(Boolean).join(', ')} — scheduled sessions that were not completed.`}
                {' '}Contact your teacher if you need to reschedule.
              </p>
            </div>
          </div>
          <Link
            href="/student/sessions"
            className="flex-shrink-0 text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            View →
          </Link>
        </div>
      )}

      {/* ── Top section: 2-col on desktop ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">

        {/* Main state card — 3/5 cols */}
        <div className="lg:col-span-3">
          {nextSession ? (
            <ActiveSessionCard session={nextSession} isUnpaid={nextSessionUnpaid} unpaidCourseId={nextSessionCourseId} />
          ) : hasPending ? (
            <PendingStatusCard
              nextMonday={monday}
              daysToMonday={daysToMonday}
              courseName={pendingEnrollments[0]?.courses?.name ?? 'your course'}
            />
          ) : (
            <EmptySessionCard />
          )}
        </div>

        {/* Stats — 2/5 cols */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 lg:grid-cols-1 gap-3 scrollbar-hide">
            {[
              { icon: '🎯', label: 'Sessions done',  value: String(completedCount) },
              { icon: '📅', label: 'Upcoming',       value: String(upcomingSessions.length) },
              { icon: '📚', label: 'Active courses', value: String(activeCourses.length) },
            ].map(s => (
              <div key={s.label} className="flex-shrink-0 w-36 sm:w-auto bg-white rounded-2xl p-4 lg:p-5 border border-gray-100 shadow-sm flex lg:flex-row flex-col lg:items-center gap-2 lg:gap-3">
                <div className="text-xl lg:text-3xl">{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-lg lg:text-2xl font-bold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-[10px] lg:text-xs text-gray-400 mt-0.5 truncate uppercase tracking-wider font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick access</p>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              {[
                { href: '/student/sessions',     icon: '📅', label: 'Sessions' },
                { href: '/student/courses',       icon: '📚', label: 'Courses' },
                { href: '/student/device-check',  icon: '🎥', label: 'Device' },
              ].map(l => (
                <Link key={l.href} href={l.href} className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-3 px-2 py-3 lg:px-3 lg:py-2.5 rounded-xl text-center lg:text-left text-xs lg:text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-100">
                  <span className="text-base">{l.icon}</span> 
                  <span className="truncate">{l.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Active courses — one progress card per course ──────── */}
      {activeCourses.length > 0 && (
        <>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Active Courses</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeCourses.map(c => {
                const pct = Math.min((c.done / Math.max(c.total, 1)) * 100, 100)
                return (
                  <div
                    key={c.groupId}
                    className={`bg-white rounded-2xl border shadow-sm p-5 ${c.isUnpaid ? 'border-orange-200' : 'border-gray-100'}`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {c.teacherAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.teacherAvatar} alt={c.teacherName} className="w-12 h-12 rounded-2xl object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_GRADS[0]} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                          {c.teacherName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{LANG_EMOJI[c.language] ?? '🌍'}</span>
                          <p className="font-bold text-gray-900 truncate">{c.name}</p>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          with {c.teacherName}{c.partners.length > 0 ? ` · ${c.partners.join(', ')}` : ''}
                        </p>
                      </div>
                      {c.isUnpaid ? (
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">🔒 Unpaid</span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex-shrink-0">Active</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-500">Week {c.week} of {c.totalWeeks}</span>
                      <span className="text-xs text-gray-400">{c.done}/{c.total} sessions</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                      <div
                        className={`h-2 rounded-full transition-all ${c.isUnpaid ? 'bg-gradient-to-r from-orange-300 to-orange-500' : 'bg-gradient-to-r from-brand-400 to-brand-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {c.isUnpaid ? (
                      <Link
                        href={`/student/courses/${c.courseId}/checkout`}
                        className="block text-center text-xs font-bold py-2.5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        Pay to unlock sessions 🔒
                      </Link>
                    ) : c.teacherId ? (
                      <MessageButton
                        userId={c.teacherId}
                        basePath="/student/messages"
                        label="Message teacher"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      />
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Schedule strip */}
          {upcomingSessions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
                <Link href="/student/sessions" className="text-sm font-medium text-brand-500 hover:text-brand-600">
                  View all →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {upcomingSessions.slice(0, 4).map((s, i) => {
                  const isNext = i === 0
                  const isActive = s.status === 'active'
                  const canJoin = isActive || (new Date(s.scheduled_at).getTime() - new Date().getTime() < 10 * 60_000)
                  // Per-course lock: this session is locked only if ITS course is unpaid.
                  const sessionCourseId = s.groups?.course_id
                  const isUnpaid = sessionCourseId ? unpaidCourseIds.has(sessionCourseId) : false
                  return (
                    <div key={s.id} className={`rounded-2xl border p-4 flex flex-col gap-3 ${isNext ? 'bg-brand-50 border-brand-200' : 'bg-white border-gray-100 shadow-sm'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isNext ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                          #{i + 1}
                        </div>
                        {isActive && !isUnpaid && (
                          <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                            🔒 Unpaid
                          </span>
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold mb-0.5 ${isNext ? 'text-brand-700' : 'text-gray-500'}`}>
                          {timeUntilStr(s.scheduled_at)}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {new Date(s.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(s.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          {' · '}{s.duration_minutes} min
                        </p>
                      </div>
                      {isUnpaid ? (
                        <Link
                          href={`/student/courses/${sessionCourseId}/checkout`}
                          className="mt-auto text-center text-xs font-bold py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                        >
                          Pay to unlock 🔒
                        </Link>
                      ) : (
                        <Link
                          href={`/student/session/${s.room_token}`}
                          className={`mt-auto text-center text-xs font-bold py-2 rounded-xl transition-colors ${
                            canJoin
                              ? 'bg-brand-500 text-white hover:bg-brand-600'
                              : 'bg-gray-100 text-gray-400 pointer-events-none'
                          }`}
                        >
                          {canJoin ? (isActive ? 'Join Now 🔴' : 'Join →') : 'Not yet open'}
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
              {upcomingSessions.length > 4 && (
                <p className="text-center text-sm text-gray-400 mt-3">
                  +{upcomingSessions.length - 4} more sessions ·{' '}
                  <Link href="/student/sessions" className="text-brand-500 hover:text-brand-600">see all</Link>
                </p>
              )}
            </section>
          )}
        </>
      )}

      {/* ── Pending enriched sections ───────────────────────────── */}
      {hasPending && (
        <>
          {/* Meet your potential teachers */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Meet your potential teachers</h2>
                <p className="text-sm text-gray-400 mt-0.5">One of these teachers will be assigned to your group on Monday.</p>
              </div>
            </div>
            {pendingTeachers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pendingTeachers.map((t, i) => (
                  <div key={t.teacher_id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center hover:border-brand-200 transition-colors">
                    {t.profiles?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.profiles.avatar_url} alt={t.profiles.name} className="w-16 h-16 rounded-full object-cover mb-3" />
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${AVATAR_GRADS[i % AVATAR_GRADS.length]} flex items-center justify-center text-white font-bold text-2xl mb-3`}>
                        {t.profiles?.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <p className="font-bold text-gray-900 text-sm">{t.profiles?.name ?? 'Teacher'}</p>
                    {t.profiles && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.profiles.years_experience ?? 0}y exp · ★ {Number(t.profiles.rating ?? 0).toFixed(1)}
                      </p>
                    )}
                    {t.profiles?.languages_taught?.length ? (
                      <div className="flex flex-wrap justify-center gap-1 mt-2">
                        {t.profiles.languages_taught.slice(0, 2).map(l => (
                          <span key={l.lang} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{l.lang}</span>
                        ))}
                      </div>
                    ) : null}
                    {t.profiles?.bio && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{t.profiles.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-purple-50 rounded-2xl p-5 text-sm text-purple-700">
                Teacher profiles are being finalised. All Bayyan teachers are vetted native or certified speakers — you&apos;ll be notified when yours is confirmed.
              </div>
            )}
          </section>

          {/* Schedule + prep — 2-col on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

            {/* Your estimated schedule */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-1">Your available slots</h3>
              <p className="text-sm text-gray-400 mb-4">
                Based on your availability.
                {profile && (profile as { timezone?: string | null }).timezone && (
                  <> Times shown for <span className="text-gray-600">{(profile as { timezone?: string | null }).timezone}</span>.</>
                )}
              </p>
              {slots.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                  {slots.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 bg-brand-50 rounded-xl px-4 py-2.5 border border-brand-100/50">
                      <span className="text-[10px] font-black text-brand-700 w-8 uppercase tracking-wider">{s.day}</span>
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tight">{s.slot}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100 leading-relaxed">
                    Your teacher will propose specific times within these windows.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4">
                  No availability saved.{' '}
                  <Link href="/student/profile" className="text-brand-500 font-medium hover:text-brand-600">
                    Update your profile →
                  </Link>
                </div>
              )}
            </div>

            {/* Pre-course prep checklist */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h3 className="font-bold text-gray-900 mb-1">Get ready</h3>
              <p className="text-sm text-gray-400 mb-4">Complete these before your first session.</p>
              <div className="space-y-3">
                {[
                  {
                    icon: '🎥',
                    label: 'Test your camera & microphone',
                    sub: 'Make sure your setup works before day one.',
                    href: '/student/device-check',
                    cta: 'Run test →',
                  },
                  {
                    icon: '📚',
                    label: 'Review the curriculum',
                    sub: "See what you'll cover week by week.",
                    href: `/student/courses/${pendingEnrollments[0]?.course_id}`,
                    cta: 'View →',
                  },
                  {
                    icon: '📅',
                    label: 'Check your availability',
                    sub: 'Keep your schedule clear for session times.',
                    href: '/student/profile',
                    cta: 'Edit →',
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                    </div>
                    <Link href={item.href} className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex-shrink-0 mt-1">
                      {item.cta}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Refund window */}
              {refundLeft > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-500">
                  <span className="text-base">↩️</span>
                  <span>
                    <span className="font-semibold text-gray-700">{refundLeft} day{refundLeft !== 1 ? 's' : ''}</span> left in your refund window.{' '}
                    <a href="mailto:support@langmaster.com" className="text-brand-500 hover:text-brand-600">Contact support</a> to request one.
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── My Courses ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
          <Link href="/student/courses" className="text-sm font-medium text-brand-500 hover:text-brand-600">
            Browse all →
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollments.map(e => {
              const lang = e.courses?.language ?? ''
              return (
                <Link key={e.id} href={`/student/courses/${e.course_id}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-brand-200 transition-all">
                    <div className="relative h-16 overflow-hidden flex items-center justify-center">
                      <CourseBannerBg language={lang} thumbnailUrl={e.courses?.thumbnail_url} name={e.courses?.name} emojiClass="text-3xl" />
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-gray-900 text-sm mb-1 truncate group-hover:text-brand-600 transition-colors">{e.courses?.name}</p>
                      <p className="text-xs text-gray-400 mb-3">{e.courses?.sessions_per_week}× / week · {e.courses?.duration_weeks} weeks</p>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[e.status] ?? STATUS_STYLE.pending}`}>
                        {e.status}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 border border-dashed border-gray-200 text-center">
            <div className="text-4xl mb-3">📚</div>
            <p className="font-semibold text-gray-700 mb-1">No enrollments yet</p>
            <p className="text-sm text-gray-400 mb-4">Pick a course and join a live group this Monday.</p>
            <Link href="/student/courses" className="inline-flex items-center gap-2 bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors">
              Explore courses →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ActiveSessionCard({ session, isUnpaid, unpaidCourseId }: { session: SessionRow; isUnpaid: boolean; unpaidCourseId?: string }) {
  const diff = new Date(session.scheduled_at).getTime() - new Date().getTime()
  const countdown = diff < 0 ? 'Started' : (() => {
    const h = Math.floor(diff / 3_600_000)
    const m = Math.floor((diff % 3_600_000) / 60_000)
    if (h > 48) return `in ${Math.floor(h / 24)} days`
    if (h > 0)  return `in ${h}h ${m}m`
    return `in ${m}m`
  })()

  return (
    <div className={`${isUnpaid ? 'bg-gradient-to-br from-orange-400 to-amber-500' : 'bg-gradient-to-br from-brand-500 to-indigo-600'} text-white rounded-3xl p-6 lg:p-8 shadow-lg shadow-purple-200 h-full flex flex-col justify-between`}>
      <div>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">Next Session</p>
        <h2 className="text-xl lg:text-2xl font-bold mb-1">{session.groups?.courses?.name}</h2>
        <p className="text-white/70 text-sm mb-1">with {session.groups?.profiles?.name ?? 'your teacher'}</p>
        <p className="text-white/80 text-sm">
          {new Date(session.scheduled_at).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
          })}
        </p>
        {isUnpaid && (
          <p className="text-white/90 text-xs font-semibold mt-2 bg-white/20 rounded-xl px-3 py-1.5 inline-block">
            🔒 Session locked — payment required
          </p>
        )}
      </div>
      <div className="flex items-center justify-between mt-6">
        <div className="bg-white/20 rounded-xl px-4 py-2 text-sm font-semibold">
          ⏰ {countdown}
        </div>
        {isUnpaid ? (
          <Link href={`/student/courses/${unpaidCourseId}/checkout`} className="bg-white text-orange-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors">
            Pay to unlock 🔒
          </Link>
        ) : (
          <Link href={`/student/session/${session.room_token}`} className="bg-white text-brand-600 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-purple-50 transition-colors">
            {session.status === 'active' ? 'Join Now 🔴' : 'Join Room →'}
          </Link>
        )}
      </div>
    </div>
  )
}

function PendingStatusCard({ nextMonday, daysToMonday, courseName }: { nextMonday: string; daysToMonday: number; courseName: string }) {
  const steps = [
    { label: 'Enrolled',         done: true },
    { label: 'Group forming',    done: false, note: `${daysToMonday} day${daysToMonday !== 1 ? 's' : ''} away` },
    { label: 'Teacher assigned', done: false },
    { label: 'Sessions start',   done: false },
  ]
  return (
    <div className="bg-white rounded-3xl border border-amber-200 p-6 lg:p-8 h-full flex flex-col">
      <div className="flex items-start gap-3 mb-5">
        <span className="text-2xl">⏳</span>
        <div>
          <h2 className="text-lg font-bold text-gray-900">You&apos;re enrolled in {courseName}!</h2>
          <p className="text-sm text-gray-500 mt-0.5">Group assignment happens every Monday. Next: <span className="font-medium text-amber-700">{nextMonday}</span>.</p>
        </div>
      </div>

      <ol className="space-y-3 flex-1">
        {steps.map((step, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
              step.done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {step.done ? '✓' : i + 1}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className={`text-sm font-semibold ${step.done ? 'text-green-700' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {step.note && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  {step.note}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
        <Link href="/student/device-check" className="flex-1 text-center text-xs font-semibold bg-brand-50 text-brand-600 py-2.5 rounded-xl hover:bg-brand-100 transition-colors">
          🎥 Test camera & mic
        </Link>
        <Link href="/student/courses" className="flex-1 text-center text-xs font-semibold bg-gray-50 text-gray-600 py-2.5 rounded-xl hover:bg-gray-100 transition-colors">
          📚 Browse more courses
        </Link>
      </div>
    </div>
  )
}

function EmptySessionCard() {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-purple-50 border border-dashed border-purple-200 rounded-3xl p-8 h-full flex flex-col items-center justify-center text-center">
      <div className="text-5xl mb-4">🎓</div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">Start your language journey</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-xs">Pick a course, get matched with a study partner, and start speaking from week one.</p>
      <Link href="/student/courses" className="bg-brand-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors">
        Browse courses →
      </Link>
    </div>
  )
}
