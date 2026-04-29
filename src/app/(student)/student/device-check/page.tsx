'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type DeviceState = 'idle' | 'requesting' | 'ok' | 'denied' | 'error'

function MicMeter({ stream }: { stream: MediaStream }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const ctx = new AudioContext()
    const src = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    src.connect(analyser)
    const data = new Uint8Array(analyser.frequencyBinCount)

    function draw() {
      analyser.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      const level = Math.min(avg / 80, 1)

      const canvas = canvasRef.current
      if (!canvas) return
      const c = canvas.getContext('2d')!
      c.clearRect(0, 0, canvas.width, canvas.height)

      const bars = 20
      const barW = (canvas.width - (bars - 1) * 3) / bars
      for (let i = 0; i < bars; i++) {
        const filled = i / bars < level
        c.fillStyle = filled
          ? i < 14 ? '#22c55e' : i < 17 ? '#f59e0b' : '#ef4444'
          : '#e5e7eb'
        const x = i * (barW + 3)
        const h = filled ? canvas.height : canvas.height * 0.3
        c.beginPath()
        c.roundRect(x, (canvas.height - h) / 2, barW, h, 2)
        c.fill()
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      ctx.close()
    }
  }, [stream])

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={32}
      className="w-full h-8 rounded"
    />
  )
}

function StatusIcon({ state }: { state: DeviceState }) {
  if (state === 'ok') return <span className="text-green-500 text-lg">✓</span>
  if (state === 'denied' || state === 'error') return <span className="text-red-500 text-lg">✗</span>
  if (state === 'requesting') return (
    <span className="w-4 h-4 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin inline-block" />
  )
  return <span className="text-gray-300 text-lg">○</span>
}

export default function DeviceCheckPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [camState, setCamState] = useState<DeviceState>('idle')
  const [micState, setMicState] = useState<DeviceState>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function startCheck() {
    setCamState('requesting')
    setMicState('requesting')
    setErrorMsg('')
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = s
      setStream(s)
      if (videoRef.current) {
        videoRef.current.srcObject = s
      }
      setCamState('ok')
      setMicState('ok')
    } catch (err: unknown) {
      const name = err instanceof Error ? err.name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCamState('denied')
        setMicState('denied')
        setErrorMsg('Permission denied. Allow camera & microphone access in your browser settings, then reload.')
      } else if (name === 'NotFoundError') {
        setCamState('error')
        setMicState('error')
        setErrorMsg('No camera or microphone found. Plug one in and try again.')
      } else {
        setCamState('error')
        setMicState('error')
        setErrorMsg('Could not access devices. Try reloading.')
      }
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const allOk = camState === 'ok' && micState === 'ok'
  const anyDenied = camState === 'denied' || micState === 'denied'

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/student/dashboard" className="text-sm text-gray-400 hover:text-gray-600">
          ← Back to dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Camera & microphone check</h1>
      <p className="text-gray-500 text-sm mb-8">Make sure your devices work before your first live session.</p>

      {/* Camera preview */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden mb-4">
        <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
          {camState === 'ok' ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <span className="text-5xl">📷</span>
              <span className="text-sm">
                {camState === 'idle' && 'Camera preview'}
                {camState === 'requesting' && 'Requesting access…'}
                {(camState === 'denied' || camState === 'error') && 'Camera unavailable'}
              </span>
            </div>
          )}
          {camState === 'ok' && (
            <div className="absolute top-3 left-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              Live preview
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Status rows */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📷</span>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Camera</p>
                  <p className="text-xs text-gray-400">
                    {camState === 'idle' && 'Not tested yet'}
                    {camState === 'requesting' && 'Requesting permission…'}
                    {camState === 'ok' && 'Working — you can be seen'}
                    {camState === 'denied' && 'Permission denied'}
                    {camState === 'error' && 'Device not found'}
                  </p>
                </div>
              </div>
              <StatusIcon state={camState} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-xl">🎙️</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Microphone</p>
                  {micState === 'ok' && stream ? (
                    <div className="mt-1.5">
                      <MicMeter stream={stream} />
                      <p className="text-xs text-gray-400 mt-1">Speak — bars should move</p>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">
                      {micState === 'idle' && 'Not tested yet'}
                      {micState === 'requesting' && 'Requesting permission…'}
                      {micState === 'denied' && 'Permission denied'}
                      {micState === 'error' && 'Device not found'}
                    </p>
                  )}
                </div>
              </div>
              {micState !== 'ok' && (
                <div className="ml-3 flex-shrink-0">
                  <StatusIcon state={micState} />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {/* CTA */}
          {camState === 'idle' && (
            <button
              onClick={startCheck}
              className="w-full bg-brand-500 text-white font-bold py-3.5 rounded-2xl hover:bg-brand-600 transition-colors"
            >
              Test camera & microphone
            </button>
          )}

          {(camState === 'denied' || camState === 'error') && (
            <button
              onClick={startCheck}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>

      {/* All clear */}
      {allOk && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-6 text-center mb-4">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="font-bold text-green-800 text-lg mb-1">All clear — you&apos;re ready!</h2>
          <p className="text-green-700 text-sm mb-5">Camera and microphone are working. You&apos;ll have no issues joining your sessions.</p>
          <Link
            href="/student/dashboard"
            className="inline-flex bg-brand-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors text-sm"
          >
            Back to dashboard →
          </Link>
        </div>
      )}

      {/* Tips */}
      {!allOk && (
        <div className="bg-gray-50 rounded-2xl p-5">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Tips if it&apos;s not working</h3>
          <ul className="space-y-2 text-xs text-gray-500">
            {[
              'Click the camera icon in your browser address bar and allow access.',
              'Check your OS privacy settings — camera/mic must be allowed for this browser.',
              'Close other apps that might be using your camera (Zoom, Teams, etc.).',
              'Try a different browser (Chrome or Edge work best).',
              anyDenied && 'After allowing access, reload this page.',
            ].filter(Boolean).map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex-shrink-0 text-gray-300">•</span>
                {tip as string}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
