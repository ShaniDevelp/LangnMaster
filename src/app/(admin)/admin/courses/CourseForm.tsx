'use client'
import { useState, useTransition } from 'react'
import type { CourseInput } from '@/lib/admin/course-actions'
import { CourseImageUpload } from '@/components/CourseImageUpload'

const LEVELS: CourseInput['level'][] = ['beginner', 'intermediate', 'advanced']

const EMPTY: CourseInput = {
  name: '',
  description: '',
  language: '',
  level: 'beginner',
  duration_weeks: 8,
  sessions_per_week: 2,
  max_group_size: 4,
  price_pkr: 15000,
  thumbnail_url: null,
  is_active: true,
  outcomes: [],
}

type Props = {
  initial?: Partial<CourseInput>
  submitLabel: string
  onSubmit: (data: CourseInput) => Promise<{ error?: string }>
  onSuccess?: () => void
}

export function CourseForm({ initial, submitLabel, onSubmit, onSuccess }: Props) {
  const [form, setForm] = useState<CourseInput>({ ...EMPTY, ...initial })
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function set<K extends keyof CourseInput>(key: K, value: CourseInput[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await onSubmit(form)
      if (res?.error) setError(res.error)
      else onSuccess?.()
    })
  }

  const inputCls = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6c4ff5]'
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelCls}>Course Name</label>
        <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Conversational Spanish" />
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What students will learn..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Language</label>
          <input className={inputCls} value={form.language} onChange={e => set('language', e.target.value)} placeholder="e.g. Spanish" />
        </div>
        <div>
          <label className={labelCls}>Level</label>
          <select className={inputCls} value={form.level} onChange={e => set('level', e.target.value as CourseInput['level'])}>
            {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Duration (weeks)</label>
          <input type="number" min={1} className={inputCls} value={form.duration_weeks} onChange={e => set('duration_weeks', Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Sessions / week</label>
          <input type="number" min={1} className={inputCls} value={form.sessions_per_week} onChange={e => set('sessions_per_week', Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Max group size</label>
          <input type="number" min={1} className={inputCls} value={form.max_group_size} onChange={e => set('max_group_size', Number(e.target.value))} />
        </div>
        <div>
          <label className={labelCls}>Price (PKR)</label>
          <input type="number" min={0} step="0.01" className={inputCls} value={form.price_pkr} onChange={e => set('price_pkr', Number(e.target.value))} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Banner image <span className="text-gray-300 normal-case">(optional)</span></label>
        <CourseImageUpload value={form.thumbnail_url} onChange={url => set('thumbnail_url', url)} />
      </div>

      {/* What students will learn */}
      <div>
        <label className={labelCls}>What students will learn</label>
        <div className="space-y-2">
          {form.outcomes.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={o}
                onChange={e => set('outcomes', form.outcomes.map((v, idx) => idx === i ? e.target.value : v))}
                placeholder={`Outcome ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => set('outcomes', form.outcomes.filter((_, idx) => idx !== i))}
                className="w-9 h-9 flex-shrink-0 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                aria-label="Remove outcome"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('outcomes', [...form.outcomes, ''])}
            className="text-sm font-semibold text-[#6c4ff5] hover:text-[#5c3de8] transition-colors"
          >
            + Add learning outcome
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="w-4 h-4 rounded accent-[#6c4ff5]" />
        <span className="text-sm font-medium text-gray-700">Active — visible to students for enrollment</span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 font-semibold text-sm rounded-xl p-3">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 bg-[#6c4ff5] hover:bg-[#5c3de8] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 active:scale-95"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  )
}
