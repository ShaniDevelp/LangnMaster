'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getAvatarUploadUrl, saveAvatar, clearAvatar } from '@/lib/profile/avatar-actions'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface Props {
  name: string
  initialUrl: string | null
  /** Tailwind gradient classes for the fallback initials tile. */
  fallbackGradient?: string
}

export function AvatarUpload({
  name,
  initialUrl,
  fallbackGradient = 'from-brand-400 to-indigo-500',
}: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const initial = name?.charAt(0)?.toUpperCase() ?? '?'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    ;(e.target as HTMLInputElement).value = ''
    if (!file) return

    setError(null)
    if (!ALLOWED_MIME.includes(file.type)) {
      setError('Use a JPG, PNG, WEBP or GIF image.')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image too large — max 5 MB.')
      return
    }

    setBusy(true)
    try {
      const signed = await getAvatarUploadUrl(file.name)
      if ('error' in signed) { setError(signed.error); return }

      const supabase = createClient()
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type })
      if (upErr) { setError(upErr.message); return }

      const saved = await saveAvatar(signed.path)
      if ('error' in saved) { setError(saved.error); return }

      setUrl(saved.url)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove() {
    setError(null)
    setBusy(true)
    try {
      const res = await clearAvatar()
      if (res.error) { setError(res.error); return }
      setUrl(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="w-20 h-20 rounded-2xl object-cover" />
        ) : (
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${fallbackGradient} flex items-center justify-center text-white font-bold text-2xl`}>
            {initial}
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center text-white text-sm">
            <span className="animate-spin">⏳</span>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {busy ? 'Uploading…' : url ? 'Change photo' : 'Upload photo'}
          </button>
          {url && !busy && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP or GIF · max 5 MB</p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_MIME.join(',')}
        onChange={handleFile}
        className="hidden"
        disabled={busy}
      />
    </div>
  )
}
