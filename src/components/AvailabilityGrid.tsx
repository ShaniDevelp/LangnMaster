'use client'
import { useState, useTransition } from 'react'
import { saveAvailability } from '@/lib/teacher/phase4-actions'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6 // 06:00 – 22:00
  return `${String(h).padStart(2, '0')}:00`
})

// Slot format: "Mon-09:00"
function slotKey(day: string, hour: string) { return `${day}-${hour}` }

type Props = {
  initialSlots: string[]
  onSaved?: () => void
}

export function AvailabilityGrid({ initialSlots, onSaved }: Props) {
  const [slots, setSlots] = useState<Set<string>>(new Set(initialSlots))
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add')

  function toggle(key: string) {
    setSlots(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleMouseDown(key: string) {
    const removing = slots.has(key)
    setDragMode(removing ? 'remove' : 'add')
    setIsDragging(true)
    toggle(key)
  }

  function handleMouseEnter(key: string) {
    if (!isDragging) return
    setSlots(prev => {
      const next = new Set(prev)
      dragMode === 'remove' ? next.delete(key) : next.add(key)
      return next
    })
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAvailability(Array.from(slots))
      setMsg(result.error ? `Error: ${result.error}` : 'Availability saved ✓')
      setTimeout(() => setMsg(null), 2500)
      if (!result.error) onSaved?.()
    })
  }

  function clearAll() { setSlots(new Set()) }
  function selectWeekdays() {
    const next = new Set(slots)
    DAYS.slice(0, 5).forEach(d => HOURS.forEach(h => next.add(slotKey(d, h))))
    setSlots(next)
  }

  const selectedCount = slots.size

  return (
    <div
      className="space-y-4"
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" onClick={selectWeekdays}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
            Select weekdays
          </button>
          <button type="button" onClick={clearAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            Clear all
          </button>
          <span className="text-xs text-gray-400">{selectedCount} slot{selectedCount !== 1 ? 's' : ''} selected</span>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className={`text-xs font-medium ${msg.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{msg}</span>}
          <button type="button" onClick={handleSave} disabled={isPending}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-[#6c4ff5] text-white hover:bg-[#5c3de8] transition-colors disabled:opacity-40">
            {isPending ? 'Saving…' : 'Save availability'}
          </button>
        </div>
      </div>

      {/* Grid — drag to select */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <div className="min-w-[600px]">
          {/* Day headers */}
          <div className="grid bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
            <div className="px-2 py-2.5 text-xs font-semibold text-gray-400 text-center">Time</div>
            {DAYS.map(d => (
              <div key={d} className="py-2.5 text-xs font-bold text-gray-600 text-center border-l border-gray-100">{d}</div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map(hour => (
            <div key={hour} className="grid border-b border-gray-50 last:border-0" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
              <div className="px-2 py-2 text-xs text-gray-400 text-center self-center flex-shrink-0">{hour}</div>
              {DAYS.map(day => {
                const key = slotKey(day, hour)
                const active = slots.has(key)
                return (
                  <div
                    key={key}
                    onMouseDown={() => handleMouseDown(key)}
                    onMouseEnter={() => handleMouseEnter(key)}
                    className={`border-l border-gray-50 h-8 cursor-pointer select-none transition-colors ${
                      active ? 'bg-[#6c4ff5]' : 'hover:bg-purple-50'
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#6c4ff5]" />
          Available
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
          Unavailable
        </div>
        <span className="text-gray-400">Click or drag to toggle</span>
      </div>
    </div>
  )
}
