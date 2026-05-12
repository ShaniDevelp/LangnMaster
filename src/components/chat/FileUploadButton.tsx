'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUploadSignedUrl } from '@/lib/chat/actions'

const MAX_SIZE = 25 * 1024 * 1024 // 25 MB
const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
]

interface UploadResult {
  fileUrl: string
  fileName: string
  fileSize: number
  mimeType: string
  isImage: boolean
}

interface Props {
  conversationId: string
  onUploaded: (result: UploadResult) => void
  disabled?: boolean
}

export function FileUploadButton({ conversationId, onUploaded, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!e.target) return
    ;(e.target as HTMLInputElement).value = ''
    if (!file) return

    if (file.size > MAX_SIZE) {
      alert('File too large. Maximum 25 MB.')
      return
    }
    if (!ALLOWED_MIME.includes(file.type)) {
      alert('File type not supported.')
      return
    }

    setUploading(true)
    const isImage = file.type.startsWith('image/')
    const bucket: 'chat-attachments' = 'chat-attachments'

    const result = await getUploadSignedUrl(conversationId, file.name, bucket)

    if ('error' in result) {
      setUploading(false)
      alert('Upload failed: ' + result.error)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(result.path, result.token, file, { contentType: file.type })

    setUploading(false)

    if (error) {
      alert('Upload failed: ' + error.message)
      return
    }

    onUploaded({
      fileUrl: result.path,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      isImage,
    })
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ALLOWED_MIME.join(',')}
        onChange={handleFile}
        disabled={disabled || uploading}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        title="Attach file"
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-40 flex-shrink-0"
      >
        {uploading ? (
          <span className="animate-spin text-sm">⏳</span>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        )}
      </button>
    </>
  )
}
