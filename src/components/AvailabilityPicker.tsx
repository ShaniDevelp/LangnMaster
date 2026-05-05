'use client'
import { useState, useEffect } from 'react'
import {
  DAYS, PERIODS, PERIOD_LOCAL_HOURS, PERIOD_LABEL,
  utcSlotsToLocal, localSlotsToUTC, expandPeriodToUTC,
  activePeriodsLocal,
  type DayKey, type PeriodKey,
} from '@/lib/availability'

function fmt(h: number): string {
  return `${String(((h % 24) + 24) % 24).padStart(2, '0')}:00`
}

function periodColor(period: PeriodKey) {
  if (period === 'morning')   return { active: 'bg-amber-400 text-white', hover: 'hover:bg-amber-50 hover:text-amber-700', dot: 'bg-amber-400' }
  if (period === 'afternoon') return { active: 'bg-orange-500 text-white', hover: 'hover:bg-orange-50 hover:text-orange-700', dot: 'bg-orange-400' }
  return { active: 'bg-[#6c4ff5] text-white', hover: 'hover:bg-purple-50 hover:text-purple-700', dot: 'bg-[#6c4ff5]' }
}

type Props = {
  /** UTC hourly slots already saved in DB e.g. ["Mon-13:00", "Mon-14:00"] */
  utcSlots: string[]
  /** IANA timezone string of this user e.g. "Asia/Karachi" */
  timezone: string
  /** Called whenever selection changes — receives new UTC slots array */
  onChange: (utcSlots: string[]) => void
}

/**
 * Two-level availability picker.
 * Level 1: Period row grid (Morning / Afternoon / Evening × Mon-Sun)
 *   – clicking a period auto-selects all its hours and expands a fine-tune panel below
 * Level 2: Per-hour toggle buttons inside the expanded panel
 *
 * All values passed in/out are UTC-based hourly slot strings.
 * Display is in `timezone` local time.
 */
export function AvailabilityPicker({ utcSlots, timezone, onChange }: Props) {
  // Work in local-time internally; convert on change
  const [localSlots, setLocalSlots] = useState<string[]>(() =>
    utcSlotsToLocal(utcSlots, timezone)
  )
  const [expanded, setExpanded] = useState<Set<string>>(new Set()) // "Mon-morning" etc.

  // Re-convert when timezone changes (e.g. user just selected timezone in same form)
  useEffect(() => {
    setLocalSlots(utcSlotsToLocal(utcSlots, timezone))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timezone])

  function emitChange(next: string[]) {
    setLocalSlots(next)
    onChange(localSlotsToUTC(next, timezone))
  }

  function isPeriodActive(day: DayKey, period: PeriodKey): boolean {
    const hours = PERIOD_LOCAL_HOURS[period]
    return hours.some(h => localSlots.includes(`${day}-${fmt(h)}`))
  }

  function isPeriodFullyActive(day: DayKey, period: PeriodKey): boolean {
    const hours = PERIOD_LOCAL_HOURS[period]
    return hours.every(h => localSlots.includes(`${day}-${fmt(h)}`))
  }

  function togglePeriod(day: DayKey, period: PeriodKey) {
    const hours = PERIOD_LOCAL_HOURS[period]
    const periodSlots = hours.map(h => `${day}-${fmt(h)}`)
    const anyActive = periodSlots.some(s => localSlots.includes(s))

    let next: string[]
    if (anyActive) {
      // Deselect all hours in this period
      next = localSlots.filter(s => !periodSlots.includes(s))
    } else {
      // Select all hours in this period
      next = [...new Set([...localSlots, ...periodSlots])]
    }

    // Auto-expand this period when turning it on
    const key = `${day}-${period}`
    if (!anyActive) {
      setExpanded(prev => new Set([...prev, key]))
    }
    emitChange(next)
  }

  function toggleHour(day: DayKey, h: number) {
    const slot = `${day}-${fmt(h)}`
    const next = localSlots.includes(slot)
      ? localSlots.filter(s => s !== slot)
      : [...localSlots, slot]
    emitChange(next)
  }

  function toggleExpand(day: DayKey, period: PeriodKey) {
    const key = `${day}-${period}`
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const totalSelected = localSlots.length

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{totalSelected} hour slot{totalSelected !== 1 ? 's' : ''} selected</span>
        <button
          type="button"
          onClick={() => emitChange([])}
          className="font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Period grid */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* Day header */}
        <div className="grid border-b border-gray-100 bg-gray-50" style={{ gridTemplateColumns: '90px repeat(7, 1fr)' }}>
          <div />
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-bold text-gray-500">{d}</div>
          ))}
        </div>

        {/* Period rows */}
        {PERIODS.map((period, pi) => {
          const colors = periodColor(period)
          return (
            <div key={period}>
              {/* Period row */}
              <div
                className={`grid items-center ${pi !== 0 ? 'border-t border-gray-100' : ''}`}
                style={{ gridTemplateColumns: '90px repeat(7, 1fr)' }}
              >
                <div className="px-3 py-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </span>
                  <p className="text-[9px] text-gray-300 leading-tight mt-0.5">
                    {period === 'morning' ? '6am–12pm' : period === 'afternoon' ? '12pm–6pm' : '6pm–12am'}
                  </p>
                </div>
                {DAYS.map(day => {
                  const active = isPeriodActive(day, period)
                  const full   = isPeriodFullyActive(day, period)
                  const expandKey = `${day}-${period}`
                  const isOpen = expanded.has(expandKey)
                  return (
                    <div key={day} className="py-2 px-1 flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePeriod(day, period)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold border-2 transition-all ${
                          active
                            ? `${colors.active} border-transparent shadow-sm`
                            : `border-gray-100 bg-gray-50 text-gray-300 ${colors.hover}`
                        }`}
                        title={`Toggle ${day} ${period}`}
                      >
                        {full ? '✓' : active ? '~' : ''}
                      </button>
                      {active && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(day, period)}
                          className="text-[9px] text-gray-400 hover:text-gray-600 leading-none"
                          title="Fine-tune hours"
                        >
                          {isOpen ? '▲' : '▼'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Hour expansion rows — shown when any day in this period is expanded */}
              {DAYS.some(d => expanded.has(`${d}-${period}`)) && (
                <div className="bg-gray-50 border-t border-dashed border-gray-100">
                  {PERIOD_LOCAL_HOURS[period].map(h => (
                    <div
                      key={h}
                      className="grid items-center border-t border-gray-100 first:border-0"
                      style={{ gridTemplateColumns: '90px repeat(7, 1fr)' }}
                    >
                      <div className="px-3 py-1.5 text-[10px] text-gray-400 font-medium">
                        {h < 12 ? `${h}:00 am` : h === 12 ? '12:00 pm' : `${h - 12}:00 pm`}
                      </div>
                      {DAYS.map(day => {
                        const expandKey = `${day}-${period}`
                        if (!expanded.has(expandKey)) {
                          return <div key={day} />
                        }
                        const slot = `${day}-${fmt(h)}`
                        const active = localSlots.includes(slot)
                        const c = periodColor(period)
                        return (
                          <div key={day} className="py-1 px-1 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => toggleHour(day, h)}
                              className={`w-6 h-6 rounded-lg text-[9px] font-bold transition-all border ${
                                active
                                  ? `${c.active} border-transparent`
                                  : `border-gray-200 bg-white text-gray-300 ${c.hover}`
                              }`}
                            >
                              {active ? '✓' : ''}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-400" /> Morning</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-orange-400" /> Afternoon</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#6c4ff5]" /> Evening</div>
        <span>Click a cell to toggle all hours · Click ▼ to fine-tune individual hours</span>
      </div>
    </div>
  )
}
