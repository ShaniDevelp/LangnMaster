'use client'
import { useState } from 'react'
import Link from 'next/link'

type SessionSlim = {
  id: string
  group_id: string
  room_token: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  topic?: string | null
  course_name: string
  language: string
  student_count: number
}

type UnavailDate = string // 'YYYY-MM-DD'

type Props = {
  sessions: SessionSlim[]
  unavailDates: UnavailDate[]
  teacherTimezone: string
}

const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-purple-100 text-purple-700 border-purple-200',
  active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-50 text-red-400 border-red-100',
}

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function ScheduleClient({ sessions, unavailDates, teacherTimezone }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<'week' | 'month'>('week')

  const anchor = new Date()
  anchor.setDate(anchor.getDate() + weekOffset * 7)
  const weekDates = getWeekDates(anchor)

  // Group sessions by date
  const byDate = sessions.reduce<Record<string, SessionSlim[]>>((acc, s) => {
    const d = new Date(s.scheduled_at).toISOString().slice(0, 10)
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  const todayStr = isoDate(new Date())
  const isCurrentWeek = weekOffset === 0

  // Month view helpers
  const monthYear = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7 // Mon-start
  const monthDays: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: lastDay.getDate() }, (_, i) => new Date(anchor.getFullYear(), anchor.getMonth(), i + 1)),
  ]

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-400 mt-1">
            {teacherTimezone || 'Local time'} · {sessions.filter(s => s.status === 'scheduled').length} upcoming sessions
          </p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['week', 'month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  view === v ? 'bg-[#6c4ff5] text-white' : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          {/* Week navigation */}
          {view === 'week' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekOffset(o => o - 1)}
                className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors">
                ←
              </button>
              <button onClick={() => setWeekOffset(0)}
                disabled={isCurrentWeek}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 border border-gray-200 transition-colors">
                Today
              </button>
              <button onClick={() => setWeekOffset(o => o + 1)}
                className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors">
                →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Week view ── */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Week header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {weekDates.map((d, i) => {
              const dateStr = isoDate(d)
              const isToday = dateStr === todayStr
              const isUnavail = unavailDates.includes(dateStr)
              return (
                <div key={i} className={`px-2 py-3 text-center border-r last:border-r-0 border-gray-50 ${isUnavail ? 'bg-red-50' : ''}`}>
                  <p className="text-xs font-semibold text-gray-400">{DAYS_SHORT[i]}</p>
                  <div className={`mx-auto mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isToday ? 'bg-[#6c4ff5] text-white' : 'text-gray-700'
                  }`}>
                    {d.getDate()}
                  </div>
                  {isUnavail && <p className="text-xs text-red-400 mt-0.5">Off</p>}
                </div>
              )
            })}
          </div>

          {/* Session blocks per day */}
          <div className="grid grid-cols-7 min-h-[320px]">
            {weekDates.map((d, i) => {
              const dateStr = isoDate(d)
              const daySessions = byDate[dateStr] ?? []
              const isUnavail = unavailDates.includes(dateStr)

              return (
                <div key={i} className={`border-r last:border-r-0 border-gray-50 p-2 space-y-1.5 ${isUnavail ? 'bg-red-50/40' : ''}`}>
                  {daySessions.map(s => (
                    <Link key={s.id} href={s.status === 'completed' ? `/teacher/sessions#${s.id}` : `/teacher/session/${s.room_token}`}
                      className={`block rounded-xl border px-2 py-2 text-xs transition-all hover:shadow-sm ${STATUS_STYLES[s.status]}`}>
                      <p className="font-bold truncate">{s.course_name}</p>
                      <p className="opacity-70 mt-0.5">{fmtTime(s.scheduled_at)}</p>
                      {s.topic && <p className="opacity-60 truncate mt-0.5 italic">{s.topic}</p>}
                      <p className="opacity-60 mt-0.5">👥 {s.student_count}</p>
                    </Link>
                  ))}
                  {daySessions.length === 0 && (
                    <div className="h-full min-h-[60px] rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-300">Free</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Month view ── */}
      {view === 'month' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month header + nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <button onClick={() => setWeekOffset(o => o - 4)}
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600">←</button>
            <h2 className="font-bold text-gray-900">{monthYear}</h2>
            <button onClick={() => setWeekOffset(o => o + 4)}
              className="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600">→</button>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS_SHORT.map(d => <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((d, i) => {
              if (!d) return <div key={i} className="border-r border-b border-gray-50 min-h-[80px]" />
              const dateStr = isoDate(d)
              const daySessions = byDate[dateStr] ?? []
              const isToday = dateStr === todayStr
              const isUnavail = unavailDates.includes(dateStr)
              return (
                <div key={i} className={`border-r border-b border-gray-50 p-1.5 min-h-[80px] ${isUnavail ? 'bg-red-50/30' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                    isToday ? 'bg-[#6c4ff5] text-white' : 'text-gray-600'
                  }`}>{d.getDate()}</div>
                  <div className="space-y-0.5">
                    {daySessions.slice(0, 2).map(s => (
                      <Link key={s.id} href={s.status === 'completed' ? `/teacher/sessions#${s.id}` : `/teacher/session/${s.room_token}`}
                        className={`block rounded-md px-1.5 py-0.5 text-xs font-medium truncate border ${STATUS_STYLES[s.status]}`}>
                        {fmtTime(s.scheduled_at)} {s.course_name}
                      </Link>
                    ))}
                    {daySessions.length > 2 && (
                      <p className="text-xs text-gray-400 pl-1">+{daySessions.length - 2} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Legend:</p>
        {Object.entries(STATUS_STYLES).map(([s, cls]) => (
          <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cls}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 bg-red-50 text-red-400">Unavailable day</span>
      </div>
    </div>
  )
}
