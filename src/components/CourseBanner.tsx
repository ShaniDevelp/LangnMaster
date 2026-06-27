import * as React from 'react'

/** Per-language flag emoji + gradient. Single source of truth for course banners. */
export const COURSE_LANG_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  English:  { emoji: '🇬🇧', gradient: 'from-blue-500 to-indigo-600' },
  Spanish:  { emoji: '🇪🇸', gradient: 'from-red-500 to-orange-500' },
  French:   { emoji: '🇫🇷', gradient: 'from-blue-600 to-blue-800' },
  German:   { emoji: '🇩🇪', gradient: 'from-yellow-500 to-amber-600' },
  Mandarin: { emoji: '🇨🇳', gradient: 'from-red-600 to-red-800' },
  Japanese: { emoji: '🇯🇵', gradient: 'from-pink-400 to-rose-600' },
  Korean:   { emoji: '🇰🇷', gradient: 'from-blue-400 to-indigo-500' },
  Arabic:   { emoji: '🇸🇦', gradient: 'from-green-600 to-emerald-700' },
}

export function courseLang(language: string): { emoji: string; gradient: string } {
  return COURSE_LANG_CONFIG[language] ?? { emoji: '🌍', gradient: 'from-gray-400 to-gray-600' }
}

/**
 * Background layer for a course banner. Fills its parent (which MUST be
 * `relative overflow-hidden`). Renders the uploaded thumbnail when present,
 * otherwise the language gradient + flag emoji. Pass `scrim` when overlaying
 * text on top of the image so it stays readable.
 */
export function CourseBannerBg({
  language,
  thumbnailUrl,
  name,
  emojiClass = 'text-4xl',
  scrim = false,
}: {
  language: string
  thumbnailUrl?: string | null
  name?: string
  emojiClass?: string
  scrim?: boolean
}) {
  const cfg = courseLang(language)
  return (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`} />
      {thumbnailUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt={name ?? 'Course banner'} className="absolute inset-0 w-full h-full object-cover" />
          {scrim && <div className="absolute inset-0 bg-black/45" />}
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={emojiClass}>{cfg.emoji}</span>
        </div>
      )}
    </>
  )
}
