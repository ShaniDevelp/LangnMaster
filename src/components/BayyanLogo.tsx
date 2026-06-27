import * as React from 'react'

/**
 * Bayyan logo — inline so the wordmark renders in the site font (Inter) and
 * stays crisp at any size. Use `showWord={false}` for an icon-only mark.
 *
 * The mark = rising voice bars (speaking + level progression); the small dot is
 * the nuqta of ب (the "be" in بیان).
 */
export function BayyanLogo({
  size = 32,
  showWord = true,
  tone = 'dark',
  className,
}: {
  size?: number
  showWord?: boolean
  /** 'dark' = ink wordmark for light backgrounds; 'light' = white wordmark for dark backgrounds. */
  tone?: 'dark' | 'light'
  className?: string
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Bayyan"
      >
        <defs>
          <linearGradient id="bayyanLogoGrad" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C63F7" />
            <stop offset="1" stopColor="#4D2EC9" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#bayyanLogoGrad)" />
        <g fill="#FFFFFF">
          <rect x="16" y="24" width="6" height="16" rx="3" />
          <rect x="25" y="18" width="6" height="28" rx="3" />
          <rect x="34" y="22" width="6" height="20" rx="3" />
          <rect x="43" y="17" width="6" height="30" rx="3" />
        </g>
        <circle cx="46" cy="51" r="2.5" fill="#FFFFFF" fillOpacity="0.9" />
      </svg>
      {showWord && (
        <span
          className={`font-bold tracking-tight ${tone === 'light' ? 'text-white' : 'text-brand-900'}`}
          style={{ fontSize: size * 0.68 }}
        >
          Bayyan
        </span>
      )}
    </span>
  )
}
