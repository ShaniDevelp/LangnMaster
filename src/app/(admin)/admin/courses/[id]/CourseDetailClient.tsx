'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Course, CourseModule } from '@/lib/supabase/types'
import type { CourseStats, EnrolledStudent, CourseTeacherInfo } from './page'
import { CourseForm } from '../CourseForm'
import { updateCourse, deleteCourse, setCourseActive, saveCurriculum } from '@/lib/admin/course-actions'

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
}

const ENROLL_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

const TEACHER_STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
}

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
      {name.charAt(0)}
    </div>
  )
}

export function CourseDetailClient({ course, stats, modules, students, teachers }: {
  course: Course & { outcomes?: string[] }
  stats: CourseStats
  modules: CourseModule[]
  students: EnrolledStudent[]
  teachers: CourseTeacherInfo[]
}) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, start] = useTransition()

  function handleToggleActive() {
    start(async () => {
      await setCourseActive(course.id, !course.is_active)
      router.refresh()
    })
  }

  function handleDelete() {
    setDeleteError(null)
    start(async () => {
      const res = await deleteCourse(course.id)
      if (res.error) { setDeleteError(res.error); setConfirmDelete(false) }
      else router.push('/admin/courses')
    })
  }

  const statCard = (label: string, value: number | string) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/courses" className="text-sm text-gray-400 hover:text-gray-600">← All courses</Link>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${LEVEL_COLORS[course.level] ?? 'bg-gray-100 text-gray-600'}`}>{course.level}</span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${course.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {course.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCard('Total Enrollments', stats.totalEnrollments)}
        {statCard('Assigned', stats.enrollmentsByStatus['assigned'] ?? 0)}
        {statCard('Groups', stats.totalGroups)}
        {statCard('Price', `Rs ${Number(course.price_pkr).toLocaleString()}`)}
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Edit form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900">Edit Course</h2>
            {saved && <span className="text-xs font-semibold text-green-600">Saved ✓</span>}
          </div>
          <CourseForm
            initial={course}
            submitLabel="Save Changes"
            onSubmit={data => updateCourse(course.id, data)}
            onSuccess={() => { setSaved(true); router.refresh(); setTimeout(() => setSaved(false), 3000) }}
          />
        </div>

        {/* Side: status breakdown + danger zone */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Enrollment Breakdown</h2>
            {stats.totalEnrollments === 0 ? (
              <p className="text-sm text-gray-400">No enrollments yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {Object.entries(stats.enrollmentsByStatus).map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 capitalize">{status}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Visibility</h2>
            <button
              onClick={handleToggleActive}
              disabled={pending}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${
                course.is_active
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {course.is_active ? 'Deactivate course' : 'Activate course'}
            </button>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              {course.is_active
                ? 'Hides this course from new student enrollment. Existing groups are unaffected.'
                : 'Makes this course available for new student enrollment.'}
            </p>
          </div>

          {/* Danger zone */}
          <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h2>
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-lg p-3 mb-3 leading-relaxed">
                {deleteError}
              </div>
            )}
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={pending}
                className="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Delete course
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Permanently delete this course? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={pending}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-500 transition-colors disabled:opacity-50"
                  >
                    {pending ? 'Deleting…' : 'Yes, delete'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    disabled={pending}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* People — students + teachers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrolled students */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Enrolled Students</h2>
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-lg">{students.length}</span>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400">No students enrolled yet.</p>
          ) : (
            <ul className="space-y-3">
              {students.map(s => (
                <li key={s.id} className="flex items-center gap-3">
                  <Avatar name={s.name} url={s.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400">
                      Joined {new Date(s.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${ENROLL_STATUS_COLORS[s.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Teachers who selected this course */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Teachers</h2>
            <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-lg">{teachers.length}</span>
          </div>
          {teachers.length === 0 ? (
            <p className="text-sm text-gray-400">No teachers have selected this course yet.</p>
          ) : (
            <ul className="space-y-3">
              {teachers.map(t => (
                <li key={t.id} className="flex items-center gap-3">
                  <Avatar name={t.name} url={t.avatarUrl} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400">Teacher</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${TEACHER_STATUS_COLORS[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {t.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Curriculum editor */}
      <CurriculumEditor courseId={course.id} initialModules={modules} onSaved={() => router.refresh()} />
    </div>
  )
}

// ── Curriculum (week-by-week) editor ──────────────────────────────────────────

type WeekRow = { week_number: number; title: string; topicsText: string }

function CurriculumEditor({
  courseId, initialModules, onSaved,
}: {
  courseId: string
  initialModules: CourseModule[]
  onSaved: () => void
}) {
  const [weeks, setWeeks] = useState<WeekRow[]>(
    initialModules.map(m => ({
      week_number: m.week_number,
      title: m.title,
      topicsText: (m.topics ?? []).join('\n'),
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, start] = useTransition()

  function update(i: number, patch: Partial<WeekRow>) {
    setWeeks(ws => ws.map((w, idx) => idx === i ? { ...w, ...patch } : w))
  }
  function addWeek() {
    const next = weeks.length ? Math.max(...weeks.map(w => w.week_number)) + 1 : 1
    setWeeks(ws => [...ws, { week_number: next, title: '', topicsText: '' }])
  }
  function removeWeek(i: number) {
    setWeeks(ws => ws.filter((_, idx) => idx !== i))
  }

  function save() {
    setError(null); setSaved(false)
    start(async () => {
      const res = await saveCurriculum(
        courseId,
        weeks.map(w => ({
          week_number: w.week_number,
          title: w.title,
          topics: w.topicsText.split('\n').map(t => t.trim()).filter(Boolean),
        }))
      )
      if (res.error) setError(res.error)
      else { setSaved(true); onSaved(); setTimeout(() => setSaved(false), 3000) }
    })
  }

  const inputCls = 'bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5]'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-gray-900">Curriculum</h2>
          <p className="text-xs text-gray-500 mt-0.5">Week-by-week topics shown to students. One topic per line.</p>
        </div>
        {saved && <span className="text-xs font-semibold text-green-600">Saved ✓</span>}
      </div>

      <div className="space-y-4">
        {weeks.length === 0 && (
          <p className="text-sm text-gray-400">No curriculum yet. Add the first week below.</p>
        )}

        {weeks.map((w, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400">Week</span>
                <input
                  type="number"
                  min={1}
                  value={w.week_number}
                  onChange={e => update(i, { week_number: Number(e.target.value) })}
                  className={`${inputCls} w-16`}
                />
              </div>
              <input
                value={w.title}
                onChange={e => update(i, { title: e.target.value })}
                placeholder="Week title — e.g. Greetings & Introductions"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeWeek(i)}
                className="w-9 h-9 flex-shrink-0 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remove week"
              >
                ✕
              </button>
            </div>
            <textarea
              value={w.topicsText}
              onChange={e => update(i, { topicsText: e.target.value })}
              rows={3}
              placeholder={'Topic one\nTopic two\nTopic three'}
              className={`${inputCls} w-full resize-none`}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addWeek}
          className="text-sm font-semibold text-[#6c4ff5] hover:text-[#5c3de8] transition-colors"
        >
          + Add week
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 font-semibold text-sm rounded-xl p-3">
            ⚠️ {error}
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={save}
            disabled={pending}
            className="px-5 py-2.5 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-50 active:scale-95"
          >
            {pending ? 'Saving…' : 'Save Curriculum'}
          </button>
        </div>
      </div>
    </div>
  )
}
