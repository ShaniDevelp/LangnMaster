/**
 * Availability utilities — all slot storage is in UTC.
 *
 * Slot format: "Mon-13:00" (day name + UTC hour)
 * Period keys: "morning" | "afternoon" | "evening"
 * Day keys:    "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
 */

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export type DayKey = (typeof DAYS)[number]

export const PERIODS = ['morning', 'afternoon', 'evening'] as const
export type PeriodKey = (typeof PERIODS)[number]

/** Local clock hours (0-23) covered by each period */
export const PERIOD_LOCAL_HOURS: Record<PeriodKey, number[]> = {
  morning:   [6,  7,  8,  9,  10, 11],
  afternoon: [12, 13, 14, 15, 16, 17],
  evening:   [18, 19, 20, 21, 22, 23],
}

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  morning:   'Morning  6 am – 12 pm',
  afternoon: 'Afternoon  12 pm – 6 pm',
  evening:   'Evening  6 pm – 12 am',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Format a 0-23 hour as "HH:00"
 */
function fmt(h: number): string {
  return `${String(((h % 24) + 24) % 24).padStart(2, '0')}:00`
}

/**
 * Get the UTC offset in hours for a given IANA timezone string.
 * Uses the browser's Intl API (client-side) or a fixed fallback (server-side).
 * Returns 0 (UTC) when the timezone is empty.
 */
export function getUTCOffset(timezone: string): number {
  if (!timezone) return 0
  try {
    const now = new Date()
    // Create a date string in the target timezone and compare with UTC
    const local = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    }).format(now)
    const utc = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: 'numeric',
      hour12: false,
    }).format(now)
    return parseInt(local, 10) - parseInt(utc, 10)
  } catch {
    return 0
  }
}

// ── Core conversion ────────────────────────────────────────────────────────────

/**
 * Convert an array of LOCAL hourly slot keys to UTC slot keys.
 * e.g. "Mon-18:00" + timezone=Asia/Karachi(UTC+5) → "Mon-13:00"
 */
export function localSlotsToUTC(localSlots: string[], timezone: string): string[] {
  const offset = getUTCOffset(timezone) // local = UTC + offset
  return localSlots.map(slot => shiftSlot(slot, -offset))
}

/**
 * Convert an array of UTC hourly slot keys to LOCAL slot keys for a given timezone.
 */
export function utcSlotsToLocal(utcSlots: string[], timezone: string): string[] {
  const offset = getUTCOffset(timezone)
  return utcSlots.map(slot => shiftSlot(slot, offset))
}

/**
 * Shift a slot key by `hours` (may cross day boundary).
 */
function shiftSlot(slot: string, hours: number): string {
  if (!slot.includes('-')) return slot
  const dashIdx = slot.lastIndexOf('-')
  const day = slot.substring(0, dashIdx) as DayKey
  const h = parseInt(slot.substring(dashIdx + 1), 10)
  if (isNaN(h)) return slot

  const shiftedH = h + hours
  let dayIdx = DAYS.indexOf(day)
  if (dayIdx === -1) return slot

  let adjustedH = shiftedH
  if (shiftedH < 0) {
    adjustedH += 24
    dayIdx = (dayIdx - 1 + 7) % 7
  } else if (shiftedH >= 24) {
    adjustedH -= 24
    dayIdx = (dayIdx + 1) % 7
  }
  return `${DAYS[dayIdx]}-${fmt(adjustedH)}`
}

// ── Period ↔ Hourly ───────────────────────────────────────────────────────────

/**
 * Expand a period into UTC hourly slot keys given the user's timezone.
 * e.g. expandPeriodToUTC('Mon', 'evening', 'Asia/Karachi') → ['Mon-13:00','Mon-14:00',...]
 */
export function expandPeriodToUTC(day: DayKey, period: PeriodKey, timezone: string): string[] {
  const localSlots = PERIOD_LOCAL_HOURS[period].map(h => `${day}-${fmt(h)}`)
  return localSlotsToUTC(localSlots, timezone)
}

/**
 * Get all UTC slots for an array of "day-period" style entries.
 * Used in migration and onboarding/application save paths.
 */
export function expandOldFormatToUTC(dayPeriods: string[], timezone: string): string[] {
  const result: string[] = []
  for (const item of dayPeriods) {
    const parts = item.split('-')
    if (parts.length !== 2) continue
    const rawDay = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase()
    const period = parts[1].toLowerCase() as PeriodKey
    if (!DAYS.includes(rawDay as DayKey) || !PERIODS.includes(period)) continue
    result.push(...expandPeriodToUTC(rawDay as DayKey, period, timezone))
  }
  // Deduplicate
  return [...new Set(result)]
}

// ── Period detection (for UI pre-fill) ────────────────────────────────────────

/**
 * Given a list of UTC slots and a timezone, determine which (day, period) pairs
 * are "fully or mostly active" so the period-level toggle can show as selected.
 * Returns Set of "Mon-morning", "Tue-evening" etc. in LOCAL terms.
 */
export function activePeriodsLocal(utcSlots: string[], timezone: string): Set<string> {
  const localSlots = utcSlotsToLocal(utcSlots, timezone)
  const result = new Set<string>()
  for (const day of DAYS) {
    for (const period of PERIODS) {
      const periodLocalSlots = PERIOD_LOCAL_HOURS[period].map(h => `${day}-${fmt(h)}`)
      // Consider a period "active" if at least half of its hours are selected
      const activeCount = periodLocalSlots.filter(s => localSlots.includes(s)).length
      if (activeCount >= Math.ceil(PERIOD_LOCAL_HOURS[period].length / 2)) {
        result.add(`${day}-${period}`)
      }
    }
  }
  return result
}
