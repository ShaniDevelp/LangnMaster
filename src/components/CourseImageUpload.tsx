'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCourseImageUploadUrl } from '@/lib/admin/course-image-actions'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface Props {
  /** Current banner URL (form.thumbnail_url). */
  value: string | null
  /** Called with the new public URL after upload, or null when removed. */
  onChange: (url: string | null) => void
}

/** Admin course banner uploader — wide 16:9 preview, mirrors AvatarUpload. */
export function CourseImageUpload({ value, onChange }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
      const signed = await getCourseImageUploadUrl(file.name)
      if ('error' in signed) { setError(signed.error); return }

      const supabase = createClient()
      const { error: upErr } = await supabase.storage
        .from('course-images')
        .uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type })
      if (upErr) { setError(upErr.message); return }

      onChange(signed.publicUrl)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="relative w-full aspect-[16/6] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Course banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No banner image
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-sm">
            <span className="animate-spin">⏳</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="text-sm font-semibold px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {busy ? 'Uploading…' : value ? 'Change banner' : 'Upload banner'}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
          >
            Remove
          </button>
        )}
        <span className="text-xs text-gray-400">JPG, PNG, WEBP or GIF · max 5 MB</span>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

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
