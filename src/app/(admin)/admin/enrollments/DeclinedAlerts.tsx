'use client'
import { useState, useTransition } from 'react'
import { markNotificationsRead } from '@/lib/teacher/phase4-actions'

export type DeclinedAlertRow = {
  id: string
  created_at: string
  payload: {
    teacher_name: string
    course_name: string
    course_id: string
    teacher_id: string
    reason: string | null
  }
}

export function DeclinedAlerts({ alerts }: { alerts: DeclinedAlertRow[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const visible = alerts.filter(a => !dismissed.has(a.id))
  if (visible.length === 0) return null

  function dismiss(id: string) {
    startTransition(async () => {
      await markNotificationsRead([id])
      setDismissed(prev => new Set([...prev, id]))
    })
  }

  function dismissAll() {
    const ids = visible.map(a => a.id)
    startTransition(async () => {
      await markNotificationsRead(ids)
      setDismissed(prev => new Set([...prev, ...ids]))
    })
  }

  return (
    <div className="bg-white border border-red-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 px-6 py-4 border-b border-red-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xl">❌</span>
          <div>
            <h2 className="font-bold text-red-900 text-lg">Proposals Declined by Teacher</h2>
            <p className="text-sm text-red-700 mt-0.5">
              {visible.length} declined · students returned to pending pool automatically
            </p>
          </div>
        </div>
        {visible.length > 1 && (
          <button
            onClick={dismissAll}
            disabled={isPending}
            className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            Dismiss all
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {visible.map(a => (
          <div key={a.id} className="px-4 sm:px-6 py-4 flex items-start gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-gray-900 text-sm">
                  {a.payload.teacher_name}
                  <span className="font-normal text-gray-500"> declined </span>
                  {a.payload.course_name}
                </p>
                <span className="text-xs text-gray-400">
                  · {new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {a.payload.reason && (
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  &ldquo;{a.payload.reason}&rdquo;
                </p>
              )}

              <p className="text-xs text-emerald-700 font-medium">
                ✓ Students re-added to pending pool — use Smart Suggestions or Group Builder below to reassign
              </p>
            </div>

            <button
              onClick={() => dismiss(a.id)}
              disabled={isPending}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors text-sm disabled:opacity-50"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
