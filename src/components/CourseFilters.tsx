'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

const LEVELS = ['beginner', 'intermediate', 'advanced']
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low → high' },
  { value: 'price_desc', label: 'Price: high → low' },
  { value: 'duration_asc', label: 'Shortest first' },
]

export function CourseFilters({ languages }: { languages: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [, startTransition] = useTransition()

  const activeLang = params.get('lang') ?? 'all'
  const activeLevel = params.get('level') ?? 'all'
  const activeSort = params.get('sort') ?? 'popular'

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value === 'all' || value === 'popular') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    next.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false })
    })
  }

  return (
    <div className="space-y-3">
      {/* Language filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={activeLang === 'all'} onClick={() => update('lang', 'all')}>All</FilterChip>
        {languages.map(l => {
          const isEnglish = l === 'English'
          return (
            <FilterChip
              key={l}
              active={activeLang === l}
              onClick={() => update('lang', l)}
              disabled={!isEnglish}
            >
              {l}
              {!isEnglish && <span className="text-[9px] opacity-60 ml-1.5 font-normal tracking-tight">coming soon</span>}
            </FilterChip>
          )
        })}
      </div>

      {/* Level + sort row */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={activeLevel === 'all'} onClick={() => update('level', 'all')} size="sm">All levels</FilterChip>
        {LEVELS.map(lv => (
          <FilterChip key={lv} active={activeLevel === lv} onClick={() => update('level', lv)} size="sm">
            {lv[0].toUpperCase() + lv.slice(1)}
          </FilterChip>
        ))}
        <div className="ml-auto">
          <select
            value={activeSort}
            onChange={e => update('sort', e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

function FilterChip({
  children,
  active,
  onClick,
  size = 'md',
  disabled = false,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
  size?: 'sm' | 'md'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`rounded-full font-medium transition-all border flex items-center ${
        size === 'sm' ? 'text-xs px-3 py-1' : 'text-sm px-4 py-1.5'
      } ${
        disabled
          ? 'bg-gray-50/50 text-gray-400 border-gray-100 cursor-not-allowed'
          : active
            ? 'bg-brand-500 text-white border-brand-500'
            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {children}
    </button>
  )
}
