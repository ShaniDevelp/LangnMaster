'use client'
import { useRef } from 'react'

/**
 * Controlled 6-box one-time-code input. Parent owns the digit array; this only
 * handles focus movement, paste, and backspace. Calls onComplete when the last
 * box fills so the parent can auto-submit.
 */
export function OtpInput({
  digits,
  setDigits,
  length = 6,
  disabled,
  onComplete,
}: {
  digits: string[]
  setDigits: (d: string[]) => void
  length?: number
  disabled?: boolean
  onComplete?: (code: string) => void
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function set(i: number, val: string) {
    const clean = val.replace(/\D/g, '')
    if (!clean) {
      setDigits(digits.map((x, idx) => (idx === i ? '' : x)))
      return
    }
    if (clean.length > 1) {
      const next = clean.slice(0, length).split('')
      const filled = Array(length).fill('').map((_, idx) => next[idx] ?? '')
      setDigits(filled)
      const last = Math.min(next.length, length) - 1
      inputs.current[last]?.focus()
      if (next.length >= length) onComplete?.(filled.join(''))
      return
    }
    const d = digits.slice()
    d[i] = clean
    setDigits(d)
    if (i < length - 1) inputs.current[i + 1]?.focus()
    if (d.every(x => x) && d.join('').length === length) onComplete?.(d.join(''))
  }

  return (
    <div
      className="flex justify-between gap-2"
      onPaste={e => {
        const text = e.clipboardData.getData('text')
        if (/\d/.test(text)) { e.preventDefault(); set(0, text) }
      }}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el }}
          value={d}
          onChange={e => set(i, e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          autoFocus={i === 0}
          className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition disabled:bg-gray-50 disabled:text-gray-400"
        />
      ))}
    </div>
  )
}
