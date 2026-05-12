'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateDirectConversation } from '@/lib/chat/actions'
import type { StudentChatPartner, TeacherGroupPartners } from '@/lib/chat/actions'

// ── Student modal ─────────────────────────────────────────────────────────────

interface StudentModalProps {
  partners: StudentChatPartner[]
  basePath: string
  onClose: () => void
}

export function StudentNewConversationModal({ partners, basePath, onClose }: StudentModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [startingId, setStartingId] = useState<string | null>(null)

  const teacher = partners.filter(p => p.role === 'teacher')
  const classmates = partners.filter(p => p.role === 'student')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return { teacher, classmates }
    return {
      teacher: teacher.filter(p => p.name.toLowerCase().includes(q) || p.courseName.toLowerCase().includes(q)),
      classmates: classmates.filter(p => p.name.toLowerCase().includes(q) || p.courseName.toLowerCase().includes(q)),
    }
  }, [query, partners])

  async function start(partnerId: string) {
    if (startingId) return
    setStartingId(partnerId)
    try {
      const result = await getOrCreateDirectConversation(partnerId)
      if ('error' in result) {
        alert(result.error)
        setStartingId(null)
        return
      }
      onClose()
      router.push(`${basePath}/${result.conversationId}`)
    } catch (e) {
      alert('Something went wrong. Please try again.')
      setStartingId(null)
    }
  }

  const hasResults = filtered.teacher.length > 0 || filtered.classmates.length > 0

  return (
    <Modal onClose={onClose} title="New Message">
      <SearchInput value={query} onChange={setQuery} />

      {!hasResults && (
        <p className="text-sm text-gray-400 text-center py-8">No matches for "{query}"</p>
      )}

      {/* Teacher section */}
      {filtered.teacher.length > 0 && (
        <section>
          <SectionLabel>Your Teacher</SectionLabel>
          <div className="space-y-1">
            {filtered.teacher.map(p => (
              <StudentPartnerRow
                key={p.id}
                partner={p}
                loading={startingId === p.id}
                onStart={() => start(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Classmates section */}
      {filtered.classmates.length > 0 && (
        <section className={filtered.teacher.length > 0 ? 'mt-4' : ''}>
          <SectionLabel>Classmates</SectionLabel>
          <div className="space-y-1">
            {filtered.classmates.map(p => (
              <StudentPartnerRow
                key={p.id}
                partner={p}
                loading={startingId === p.id}
                onStart={() => start(p.id)}
              />
            ))}
          </div>
        </section>
      )}

      {partners.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm font-medium text-gray-700">No group members yet</p>
          <p className="text-xs text-gray-400 mt-1">You can message people once you're assigned to a group</p>
        </div>
      )}
    </Modal>
  )
}

function StudentPartnerRow({
  partner,
  loading,
  onStart,
}: {
  partner: StudentChatPartner
  loading: boolean
  onStart: () => void
}) {
  return (
    <button
      onClick={onStart}
      disabled={loading}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 text-left"
    >
      <PartnerAvatar name={partner.name} url={partner.avatar_url} role={partner.role} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">{partner.name}</span>
          <RoleBadge role={partner.role} />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-500 truncate">{partner.courseName}</span>
          <span className="text-gray-300">·</span>
          <LanguageBadge language={partner.courseLanguage} level={partner.courseLevel} />
        </div>
      </div>
      {loading ? (
        <span className="text-gray-400 animate-spin text-sm flex-shrink-0">⏳</span>
      ) : (
        <span className="text-gray-300 text-lg flex-shrink-0">→</span>
      )}
    </button>
  )
}

// ── Teacher modal ─────────────────────────────────────────────────────────────

interface TeacherModalProps {
  groups: TeacherGroupPartners[]
  basePath: string
  onClose: () => void
}

export function TeacherNewConversationModal({ groups, basePath, onClose }: TeacherModalProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [startingId, setStartingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    if (!q) return groups
    return groups
      .map(g => ({
        ...g,
        students: g.students.filter(s => s.name.toLowerCase().includes(q)),
      }))
      .filter(g => g.students.length > 0 || g.courseName.toLowerCase().includes(q))
  }, [query, groups])

  async function start(studentId: string) {
    if (startingId) return
    setStartingId(studentId)
    try {
      const result = await getOrCreateDirectConversation(studentId)
      if ('error' in result) {
        alert(result.error)
        setStartingId(null)
        return
      }
      onClose()
      router.push(`${basePath}/${result.conversationId}`)
    } catch (e) {
      alert('Something went wrong. Please try again.')
      setStartingId(null)
    }
  }

  return (
    <Modal onClose={onClose} title="New Message">
      <SearchInput value={query} onChange={setQuery} />

      {filtered.length === 0 && query && (
        <p className="text-sm text-gray-400 text-center py-8">No matches for "{query}"</p>
      )}

      {groups.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm font-medium text-gray-700">No active groups</p>
          <p className="text-xs text-gray-400 mt-1">Students appear here once you're assigned active groups</p>
        </div>
      )}

      <div className="space-y-5">
        {filtered.map(group => (
          <section key={group.groupId}>
            {/* Group header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 truncate">{group.courseName}</span>
                  <LanguageBadge language={group.courseLanguage} level={group.courseLevel} />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Week of {formatWeek(group.weekStart)} · {group.students.length} student{group.students.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Students in this group */}
            <div className="space-y-1 pl-1">
              {group.students.map(student => (
                <button
                  key={student.id}
                  onClick={() => start(student.id)}
                  disabled={startingId === student.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-60 text-left border border-gray-100"
                >
                  <PartnerAvatar name={student.name} url={student.avatar_url} role="student" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                    <p className="text-xs text-gray-400">Student</p>
                  </div>
                  {startingId === student.id ? (
                    <span className="text-gray-400 animate-spin text-sm flex-shrink-0">⏳</span>
                  ) : (
                    <span className="text-gray-300 text-lg flex-shrink-0">→</span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Modal>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col z-10">
        {/* Handle (mobile) */}
        <div className="sm:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-3 space-y-3">
          {children}
        </div>
      </div>
    </div>
  )
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative mb-1">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Search by name or course…"
        className="w-full bg-gray-100 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-300"
        autoFocus
      />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-1.5">
      {children}
    </p>
  )
}

function PartnerAvatar({ name, url, role }: { name: string; url: string | null; role: string }) {
  if (url) {
    return <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold ${
      role === 'teacher'
        ? 'bg-gradient-to-br from-violet-500 to-purple-600'
        : 'bg-gradient-to-br from-blue-400 to-indigo-500'
    }`}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
      role === 'teacher'
        ? 'bg-violet-100 text-violet-700'
        : 'bg-blue-100 text-blue-700'
    }`}>
      {role === 'teacher' ? 'Teacher' : 'Student'}
    </span>
  )
}

function LanguageBadge({ language, level }: { language: string; level: string }) {
  if (!language) return null
  return (
    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
      {language}{level ? ` · ${level}` : ''}
    </span>
  )
}

function formatWeek(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}
