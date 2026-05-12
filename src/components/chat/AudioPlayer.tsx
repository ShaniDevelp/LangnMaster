'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  fileUrl: string
  durationSeconds: number
  isOwn: boolean
}

export function AudioPlayer({ fileUrl, durationSeconds, isOwn }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [speed, setSpeed] = useState(1)
  const duration = durationSeconds || 1

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrentTime(el.currentTime)
    const onEnd = () => { setPlaying(false); setCurrentTime(0) }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  function togglePlay() {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = audioRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    el.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  function cycleSpeed() {
    const next = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }

  const progress = currentTime / duration

  return (
    <div className="flex items-center gap-2.5 w-[200px]">
      <audio ref={audioRef} src={fileUrl} preload="metadata" />

      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors text-sm ${
          isOwn
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-brand-50 hover:bg-brand-100 text-brand-600'
        }`}
      >
        {playing ? '⏸' : '▶'}
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        <div
          className={`h-1 rounded-full cursor-pointer relative overflow-hidden ${isOwn ? 'bg-white/25' : 'bg-gray-200'}`}
          onClick={seek}
        >
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all ${isOwn ? 'bg-white' : 'bg-brand-500'}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className={`flex justify-between text-[10px] font-medium ${isOwn ? 'text-brand-100' : 'text-gray-400'}`}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      <button
        onClick={cycleSpeed}
        className={`text-[11px] font-bold w-7 text-center flex-shrink-0 ${isOwn ? 'text-brand-100' : 'text-gray-400'} hover:opacity-70`}
      >
        {speed}×
      </button>
    </div>
  )
}

function fmt(s: number) {
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
}
