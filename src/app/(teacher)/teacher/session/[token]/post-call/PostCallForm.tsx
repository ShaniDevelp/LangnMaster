'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { savePostCall } from '@/lib/teacher/session-actions'

type Student = { id: string; name: string }
type AttendanceStatus = 'present' | 'late' | 'no_show'

const ATTENDANCE_OPTIONS: {
  key: AttendanceStatus
  label: string
  icon: string
  inactive: string
  active: string
}[] = [
  {
    key: 'present',
    label: 'Present',
    icon: '✓',
    inactive: 'bg-gray-50 border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600',
    active: 'bg-green-500 border-green-500 text-white',
  },
  {
    key: 'late',
    label: 'Late',
    icon: '!',
    inactive: 'bg-gray-50 border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600',
    active: 'bg-amber-500 border-amber-500 text-white',
  },
  {
    key: 'no_show',
    label: 'Absent',
    icon: '×',
    inactive: 'bg-gray-50 border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500',
    active: 'bg-red-500 border-red-500 text-white',
  },
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
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await savePostCall(sessionId, groupId, {
        session_notes: sessionNotes,
        homework_text: homeworkText,
        homework_url: homeworkUrl,
        attendance: students.map(s => ({ student_id: s.id, status: attendance[s.id] ?? 'present' })),
      })
      if (result && 'error' in result) {
        setError(result.error ?? 'Unknown error')
      } else {
        setSaved(true)
      }
    })
  }

  const formattedDate = new Date(scheduledAt).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })

  const presentCount = Object.values(attendance).filter(v => v === 'present').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/sessions"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              ←
            </Link>
            <span className="font-bold text-[#6c4ff5]">LangMaster</span>
            <span className="hidden sm:inline text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Session Recap</span>
          </div>
          <Link
            href="/teacher/dashboard"
            className="text-sm font-semibold text-gray-400 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Page intro */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Class Complete</span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{courseName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">Finalize session details — students will see their homework after you save.</p>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">

          {/* Left column */}
          <div className="space-y-5">

            {/* Session Notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="mb-4">
                <h2 className="font-bold text-gray-900">Private Notes</h2>
                <p className="text-xs text-gray-500 mt-0.5">Personal observations — not visible to students.</p>
              </div>
              <textarea
                value={sessionNotes}
                onChange={e => setSessionNotes(e.target.value)}
                rows={4}
                placeholder="How did the lesson go? Any observations or areas to revisit next time?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5] resize-none"
              />
            </div>

            {/* Homework */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="mb-4">
                <h2 className="font-bold text-gray-900">Homework</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sent to students — visible in their session history.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={homeworkText}
                    onChange={e => setHomeworkText(e.target.value)}
                    rows={3}
                    placeholder="e.g. Complete the exercise on page 42, practice the vocabulary list..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                    Resource Link <span className="font-normal text-gray-400 lowercase">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={homeworkUrl}
                    onChange={e => setHomeworkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5]"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 font-semibold text-sm rounded-xl p-4">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Attendance */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Attendance</h2>
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {presentCount}/{students.length} present
                </span>
              </div>

              <div className="space-y-5">
                {students.map(student => {
                  const current = attendance[student.id] ?? 'present'
                  return (
                    <div key={student.id}>
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {ATTENDANCE_OPTIONS.map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setAttendance(prev => ({ ...prev, [student.id]: opt.key }))}
                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                              current === opt.key ? opt.active : opt.inactive
                            }`}
                          >
                            <span className="text-base leading-none">{opt.icon}</span>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {students.length === 0 && (
                  <p className="text-sm text-gray-400 italic text-center py-2">No students in this group.</p>
                )}
              </div>
            </div>

            {/* Save CTA */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col items-center text-center">
              {saved ? (
                <>
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl mb-3">✅</div>
                  <p className="font-bold text-gray-900 mb-1">Recap saved!</p>
                  <p className="text-xs text-gray-500 mb-5">Students can now view their homework.</p>
                  <Link
                    href="/teacher/sessions"
                    className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm text-center transition-colors"
                  >
                    Back to Sessions
                  </Link>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-3">🏁</div>
                  <h3 className="font-bold text-gray-900 mb-1">Finish Recap</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-5">
                    Students will be notified and can view their homework.
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full py-2.5 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold rounded-xl shadow-sm shadow-purple-200 transition-colors disabled:opacity-50 text-sm"
                  >
                    {isPending ? 'Saving...' : 'Save & Close Session'}
                  </button>
                  <Link
                    href="/teacher/dashboard"
                    className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Return to dashboard
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
