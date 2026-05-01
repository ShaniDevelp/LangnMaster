'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { requestGroupAction } from '@/lib/teacher/phase4-actions'

type SessionSlim = { id: string; group_id: string; room_token: string; scheduled_at: string; status: string }

type GroupItem = {
  id: string
  week_start: string
  status: 'active' | 'completed'
  courses: { name: string; language: string; level: string; sessions_per_week: number; duration_weeks: number } | null
  group_members: { id: string; profiles: { id: string; name: string } | null }[]
  next_session: SessionSlim | null
  done_count: number
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
}

function fmtDT(iso: string) {
  return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
}

function ActionModal({ groupId, groupName, onClose }: { groupId: string; groupName: string; onClose: () => void }) {
  const [type, setType] = useState<'pause' | 'student_reassignment' | 'other'>('pause')
  const [notes, setNotes] = useState('')
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)

  const options = [
    { key: 'pause' as const,                label: 'Request pause',              desc: 'Temporarily suspend sessions' },
    { key: 'student_reassignment' as const, label: 'Request student reassignment', desc: 'Move a student to another group' },
    { key: 'other' as const,                label: 'Other',                      desc: 'Custom message to admin' },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-gray-900 mb-1">Group action request</h2>
        <p className="text-sm text-gray-500 mb-5">{groupName}</p>
        {done ? (
          <div className="text-center py-4">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-semibold text-gray-700">Request sent to admin</p>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 mb-5">
              {options.map(o => (
                <label key={o.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  type === o.key ? 'border-[#6c4ff5] bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" className="mt-0.5" checked={type === o.key} onChange={() => setType(o.key)} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{o.label}</p>
                    <p className="text-xs text-gray-400">{o.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Additional notes for admin…"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4" />
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button disabled={pending} onClick={() => start(async () => { await requestGroupAction(groupId, type, notes); setDone(true); setTimeout(onClose, 1500) })}
                className="flex-1 py-2.5 rounded-xl bg-[#6c4ff5] text-white text-sm font-bold hover:bg-[#5c3de8] disabled:opacity-40">
                {pending ? 'Sending…' : 'Send request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export function GroupsClient({ groups }: { groups: GroupItem[] }) {
  const [tab, setTab] = useState<'active' | 'completed' | 'all'>('active')
  const [actionGroup, setActionGroup] = useState<{ id: string; name: string } | null>(null)

  const filtered = tab === 'all' ? groups : groups.filter(g => g.status === tab)
  const activeCount = groups.filter(g => g.status === 'active').length
  const doneCount = groups.filter(g => g.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-emerald-600 font-medium">{activeCount} active</span>
            {doneCount > 0 && <span className="text-gray-400"> · {doneCount} completed</span>}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { k: 'active' as const,    l: `Active (${activeCount})` },
          { k: 'completed' as const, l: `Completed (${doneCount})` },
          { k: 'all' as const,       l: `All (${groups.length})` },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-lg font-bold text-gray-700">{tab === 'completed' ? 'No completed groups yet' : 'No groups yet'}</p>
          <p className="text-sm text-gray-400 mt-2">Admin will assign groups once your onboarding is complete.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map(group => {
          const next = group.next_session
          const levelStyle = LEVEL_COLORS[group.courses?.level ?? ''] ?? 'bg-gray-100 text-gray-600'
          return (
            <div key={group.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-50 flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6c4ff5]/10 to-indigo-100 flex items-center justify-center text-xl flex-shrink-0">📚</div>
                  <div>
                    <Link href={`/teacher/groups/${group.id}`} className="font-bold text-gray-900 hover:text-[#6c4ff5] transition-colors">
                      {group.courses?.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${levelStyle}`}>{group.courses?.level}</span>
                      <span className="text-xs text-gray-400">{group.courses?.language}</span>
                      <span className="text-xs text-gray-400">· {group.courses?.sessions_per_week}×/week</span>
                    </div>
                  </div>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
                  group.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {group.status}
                </span>
              </div>

              <div className="px-6 py-4 border-b border-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">Students</p>
                {group.group_members.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No students assigned</p>
                ) : (
                  <div className="flex -space-x-2">
                    {group.group_members.map(m => (
                      <div key={m.id} title={m.profiles?.name ?? ''}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                        {m.profiles?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    ))}
                    <span className="ml-3 text-sm text-gray-500 self-center">{group.group_members.length} student{group.group_members.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-4 text-xs text-gray-500">
                <span>📅 {group.done_count} done</span>
                <span>🗓 Starts {new Date(group.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                <span>{group.courses?.duration_weeks}wk</span>
              </div>

              <div className="px-6 py-4 mt-auto flex items-center gap-3 justify-between">
                {next ? (
                  <>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 font-semibold">Next session</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{fmtDT(next.scheduled_at)}</p>
                    </div>
                    <Link href={`/teacher/session/${next.room_token}`}
                      className={`text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex-shrink-0 ${
                        next.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-[#6c4ff5] text-white'}`}>
                      {next.status === 'active' ? '▶ Resume' : '▶ Lobby'}
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic flex-1 text-center">
                    {group.status === 'completed' ? 'Course completed ✓' : 'No upcoming sessions'}
                  </p>
                )}
                {group.status === 'active' && (
                  <button onClick={() => setActionGroup({ id: group.id, name: group.courses?.name ?? '' })}
                    className="text-xs text-gray-400 hover:text-[#6c4ff5] border border-gray-200 hover:border-purple-200 px-3 py-2 rounded-xl transition-colors flex-shrink-0">
                    ⚙ Actions
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {actionGroup && (
        <ActionModal groupId={actionGroup.id} groupName={actionGroup.name} onClose={() => setActionGroup(null)} />
      )}
    </div>
  )
}
