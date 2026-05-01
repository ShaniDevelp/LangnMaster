'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { savePostCall } from '@/lib/teacher/session-actions'

type Student = { id: string; name: string }
type AttendanceStatus = 'present' | 'late' | 'no_show'

const ATTENDANCE_OPTIONS: { key: AttendanceStatus; label: string; icon: string; style: string }[] = [
  { key: 'present',  label: 'Present',   icon: '✅', style: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
  { key: 'late',     label: 'Late',      icon: '🕐', style: 'border-amber-300 bg-amber-50 text-amber-700' },
  { key: 'no_show',  label: 'No Show',  icon: '❌', style: 'border-red-200 bg-red-50 text-red-600' },
]

type Props = {
  sessionId: string
  groupId: string
  roomToken: string
  courseName: string
  language: string
  scheduledAt: string
  students: Student[]
  existingNotes: string
  existingHomeworkText: string
  existingHomeworkUrl: string
}

export function PostCallForm(props: Props) {
  const {
    sessionId, groupId, courseName, scheduledAt, students,
    existingNotes, existingHomeworkText, existingHomeworkUrl,
  } = props

  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(students.map(s => [s.id, 'present']))
  )
  const [sessionNotes, setSessionNotes] = useState(existingNotes)
  const [homeworkText, setHomeworkText] = useState(existingHomeworkText)
  const [homeworkUrl, setHomeworkUrl] = useState(existingHomeworkUrl)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function setStudentAttendance(studentId: string, status: AttendanceStatus) {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await savePostCall(sessionId, groupId, {
        session_notes: sessionNotes,
        homework_text: homeworkText,
        homework_url:  homeworkUrl,
        attendance: students.map(s => ({ student_id: s.id, status: attendance[s.id] ?? 'present' })),
      })
      if (result && 'error' in result) setError(result.error ?? 'Unknown error')
    })
  }

  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  const presentCount = Object.values(attendance).filter(v => v === 'present').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-gray-300">·</span>
            <span className="hidden sm:inline text-sm font-medium text-gray-600">Post-class Summary</span>
          </div>
          <Link href="/teacher/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Skip for now
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl">
              🎉
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Class complete!</h1>
              <p className="text-sm text-gray-500">{courseName} · {formattedDate}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 xl:gap-8">

          {/* ── Left 2 cols: notes + homework ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Session notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <span className="text-xl">📝</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Session notes</h2>
                  <p className="text-xs text-gray-400">Internal notes for your reference — not shown to students</p>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  rows={4}
                  placeholder="What did you cover? Any observations about student progress, areas to revisit next time…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition"
                />
              </div>
            </div>

            {/* Homework */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <span className="text-xl">📚</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">Homework for students</h2>
                  <p className="text-xs text-gray-400">Students will see this in their sessions history</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Homework description</label>
                  <textarea
                    value={homeworkText}
                    onChange={e => setHomeworkText(e.target.value)}
                    rows={3}
                    placeholder="e.g. Review pages 45–52 in the course book. Write 5 sentences using the past tense…"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Resource link <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={homeworkUrl}
                    onChange={e => setHomeworkUrl(e.target.value)}
                    placeholder="https://… (worksheet, video, article)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-4">{error}</div>
            )}
          </div>

          {/* ── Right 1 col: attendance + submit ── */}
          <div className="space-y-5">
            {/* Attendance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <h2 className="font-bold text-gray-900 text-sm">Attendance</h2>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {presentCount}/{students.length} present
                </span>
              </div>

              {students.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No students to mark</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {students.map(student => {
                    const current = attendance[student.id] ?? 'present'
                    return (
                      <div key={student.id} className="px-5 py-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {ATTENDANCE_OPTIONS.map(opt => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setStudentAttendance(student.id, opt.key)}
                              className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                                current === opt.key ? opt.style : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                              }`}
                            >
                              <span className="text-base">{opt.icon}</span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="w-full py-4 rounded-2xl bg-[#6c4ff5] text-white font-bold text-base hover:bg-[#5c3de8] transition-colors disabled:opacity-40 shadow-lg shadow-purple-200"
              >
                {isPending ? 'Saving…' : '✓ Save & finish'}
              </button>
              <Link
                href="/teacher/dashboard"
                className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
              >
                Skip — go to dashboard
              </Link>
              <p className="text-xs text-gray-400 text-center">
                Session marked as complete. Students can see homework immediately.
              </p>
            </div>

            {/* Quick summary */}
            <div className="bg-purple-50 rounded-2xl p-5">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">Session summary</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">Students</span>
                  <span className="font-semibold text-purple-900">{students.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">Present</span>
                  <span className="font-semibold text-emerald-600">{presentCount}</span>
                </div>
                {students.length - presentCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-700">Absent / Late</span>
                    <span className="font-semibold text-red-500">{students.length - presentCount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700">Homework set</span>
                  <span className="font-semibold text-purple-900">{homeworkText ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
