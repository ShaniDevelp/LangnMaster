'use client'
import { useState, useTransition, useOptimistic } from 'react'
import { markNotificationsRead } from '@/lib/teacher/phase4-actions'

type Notification = {
  id: string
  type: string
  payload: Record<string, unknown>
  sent_at: string
  read_at: string | null
}

const TYPE_META: Record<string, { icon: string; label: string; color: string }> = {
  application_approved:    { icon: '✅', label: 'Application approved',     color: 'text-emerald-600 bg-emerald-50' },
  new_group_assigned:      { icon: '👥', label: 'New group assigned',       color: 'text-blue-600 bg-blue-50' },
  session_scheduled:       { icon: '📅', label: 'Session scheduled',        color: 'text-purple-600 bg-purple-50' },
  session_reminder_24h:    { icon: '⏰', label: 'Session reminder (24h)',   color: 'text-amber-600 bg-amber-50' },
  session_reminder_1h:     { icon: '🔔', label: 'Session reminder (1h)',    color: 'text-orange-600 bg-orange-50' },
  student_no_show:         { icon: '😶', label: 'Student no-show',         color: 'text-gray-600 bg-gray-100' },
  session_cancelled:       { icon: '❌', label: 'Session cancelled',        color: 'text-red-600 bg-red-50' },
  review_received:         { icon: '⭐', label: 'New review received',      color: 'text-amber-600 bg-amber-50' },
  payout_processed:        { icon: '💸', label: 'Payout processed',         color: 'text-emerald-600 bg-emerald-50' },
  payout_requested:        { icon: '💰', label: 'Payout requested',         color: 'text-teal-600 bg-teal-50' },
  availability_updated:    { icon: '📆', label: 'Availability updated',     color: 'text-indigo-600 bg-indigo-50' },
  availability_conflict:   { icon: '⚠️', label: 'Availability conflict',   color: 'text-red-600 bg-red-50' },
}

function getMeta(type: string) {
  return TYPE_META[type] ?? { icon: '🔔', label: type.replace(/_/g, ' '), color: 'text-gray-600 bg-gray-100' }
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'Just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)   return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildMessage(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'application_approved': return 'Your teacher application has been approved! Welcome aboard.'
    case 'new_group_assigned':   return `You've been assigned a new student group. Check your groups page.`
    case 'session_scheduled':    return `A new session has been scheduled for your group.`
    case 'session_reminder_24h': return `Reminder: you have a session scheduled in 24 hours.`
    case 'session_reminder_1h':  return `Heads up: your session starts in 1 hour.`
    case 'student_no_show':      return `A student didn't show up for today's session.`
    case 'session_cancelled':    return `A session has been cancelled by admin.`
    case 'review_received':      return `A student left you a review!`
    case 'payout_processed':     return `Your payout of $${payload.amount ?? '–'} has been processed.`
    case 'payout_requested':     return `Payout request of $${payload.amount ?? '–'} submitted. Admin will process it soon.`
    case 'availability_updated': return `Your availability has been updated (${payload.slots_count ?? 0} slots).`
    case 'availability_conflict': return `Admin scheduled a session outside your availability. Please check your schedule.`
    default: return 'You have a new notification.'
  }
}

export function NotificationsClient({ notifications }: { notifications: Notification[] }) {
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [isPending, start] = useTransition()

  const unreadCount = items.filter(n => !n.read_at).length
  const displayed = filter === 'unread' ? items.filter(n => !n.read_at) : items

  function markAllRead() {
    start(async () => {
      await markNotificationsRead([])
      setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    })
  }

  function markOneRead(id: string) {
    start(async () => {
      await markNotificationsRead([id])
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    })
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">
            {unreadCount > 0
              ? <span><span className="text-[#6c4ff5] font-semibold">{unreadCount} unread</span> of {items.length} total</span>
              : `${items.length} total · all caught up ✓`}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} disabled={isPending}
            className="self-start sm:self-auto text-sm font-semibold text-[#6c4ff5] bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors disabled:opacity-40">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
        {[
          { k: 'all' as const,    l: `All (${items.length})` },
          { k: 'unread' as const, l: `Unread (${unreadCount})` },
        ].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === t.k ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <p className="text-5xl mb-4">🔔</p>
          <p className="text-lg font-bold text-gray-700">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
          <p className="text-sm text-gray-400 mt-2">Notifications appear here when there&apos;s activity on your account.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {displayed.map(n => {
              const meta = getMeta(n.type)
              const isUnread = !n.read_at
              return (
                <div key={n.id} className={`px-5 py-4 flex items-start gap-4 transition-colors ${isUnread ? 'bg-purple-50/30' : ''}`}>
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${meta.color}`}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{meta.label}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{fmtRelative(n.sent_at)}</span>
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-[#6c4ff5] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed">{buildMessage(n.type, n.payload)}</p>
                  </div>

                  {/* Mark read */}
                  {isUnread && (
                    <button onClick={() => markOneRead(n.id)} disabled={isPending}
                      className="text-xs text-gray-400 hover:text-[#6c4ff5] transition-colors flex-shrink-0 mt-0.5">
                      ✓
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
