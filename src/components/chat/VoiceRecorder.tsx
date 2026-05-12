'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUploadSignedUrl } from '@/lib/chat/actions'

interface Props {
  conversationId: string
  onRecorded: (filePath: string, durationSeconds: number) => void
  disabled?: boolean
}

type State = 'idle' | 'recording' | 'uploading'

export function VoiceRecorder({ conversationId, onRecorded, disabled }: Props) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [state, setState] = useState<State>('idle')
  const [seconds, setSeconds] = useState(0)

  async function startRecording() {
    if (disabled || state !== 'idle') return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      const rec = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      startRef.current = Date.now()

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const dur = Math.max(1, Math.round((Date.now() - startRef.current) / 1000))
        await upload(new Blob(chunksRef.current, { type: mime }), dur, mime)
      }

      rec.start(250)
      recorderRef.current = rec
      setState('recording')
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds(s => {
        if (s >= 119) { stopRecording(); return s }
        return s + 1
      }), 1000)
    } catch {
      alert('Microphone access denied')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
    setState('uploading')
  }

  async function upload(blob: Blob, duration: number, mime: string) {
    const ext = mime.includes('webm') ? 'webm' : 'ogg'
    const res = await getUploadSignedUrl(conversationId, `voice-${Date.now()}.${ext}`, 'chat-voice-notes')
    if ('error' in res) { setState('idle'); alert('Upload failed'); return }

    const supabase = createClient()
    const { error } = await supabase.storage.from('chat-voice-notes').uploadToSignedUrl(res.path, res.token, blob, { contentType: mime })
    if (error) { setState('idle'); alert('Upload failed'); return }

    onRecorded(res.path, duration)
    setState('idle')
    setSeconds(0)
  }

  if (state === 'uploading') {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <span className="animate-spin text-sm">⏳</span>
      </div>
    )
  }

  if (state === 'recording') {
    return (
      <button
        onPointerUp={stopRecording}
        className="flex items-center gap-1.5 h-10 px-3 bg-red-500 text-white rounded-full text-xs font-semibold select-none flex-shrink-0"
      >
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        {fmt(seconds)}
      </button>
    )
  }

  return (
    <button
      onPointerDown={startRecording}
      disabled={disabled}
      title="Hold to record"
      className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-40 flex-shrink-0 select-none"
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
      </svg>
    </button>
  )
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
}
