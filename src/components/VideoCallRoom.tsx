'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Peer {
  userId: string
  name: string
  stream: MediaStream | null
  pc: RTCPeerConnection
  isMuted: boolean
  isVideoOff: boolean
}

interface Props {
  roomToken: string
  sessionId: string
  userId: string
  userName: string
  courseName: string
  isTeacher?: boolean
  onLeave?: () => void
}

const DEFAULT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
]

export function VideoCallRoom({ roomToken, sessionId, userId, userName, courseName, isTeacher, onLeave }: Props) {
  const supabase = createClient()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, Peer>>(new Map())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pendingCandidates = useRef<Map<string, RTCIceCandidateInit[]>>(new Map())
  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_ICE_SERVERS)

  const [peers, setPeers] = useState<{ userId: string; name: string; stream: MediaStream | null; isMuted: boolean; isVideoOff: boolean }[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())
  // Refs so toggle handlers inside useEffect closure can read current values
  const isMutedRef = useRef(false)
  const isVideoOffRef = useRef(false)

  const refreshPeers = useCallback(() => {
    setPeers(Array.from(peersRef.current.values()).map(p => ({
      userId: p.userId,
      name: p.name,
      stream: p.stream,
      isMuted: p.isMuted,
      isVideoOff: p.isVideoOff,
    })))
  }, [])

  const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current })

    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!)
    })

    pc.ontrack = (e) => {
      const peer = peersRef.current.get(remoteUserId)
      if (peer) {
        peer.stream = e.streams[0]
        refreshPeers()
      }
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'signal',
          payload: {
            type: 'ice-candidate',
            from: userId,
            fromName: userName,
            to: remoteUserId,
            candidate: e.candidate,
          },
        })
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setStatus('connected')
      if (pc.connectionState === 'failed') {
        peersRef.current.delete(remoteUserId)
        refreshPeers()
      }
    }

    return pc
  }, [userId, userName, refreshPeers])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        // Fetch TURN credentials before requesting media and connecting
        try {
          const res = await fetch('/api/turn')
          if (res.ok) {
            const servers = await res.json()
            if (servers && servers.length > 0) {
              iceServersRef.current = servers
            }
          }
        } catch (err) {
          console.error('Failed to fetch TURN servers, using fallback STUN', err)
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const channel = supabase.channel(`room:${roomToken}`, {
          config: { broadcast: { self: false }, presence: { key: userId } },
        })
        channelRef.current = channel

        channel.on('presence', { event: 'join' }, async ({ newPresences }) => {
          for (const p of newPresences as any[]) {
            if (p.userId === userId) continue
            if (peersRef.current.has(p.userId)) continue

            const pc = createPeerConnection(p.userId)
            peersRef.current.set(p.userId, { userId: p.userId, name: p.name ?? 'User', stream: null, pc, isMuted: false, isVideoOff: false })
            refreshPeers()

            // Announce our current media state to the new peer
            channelRef.current?.send({
              type: 'broadcast',
              event: 'media-state',
              payload: { userId, isMuted: isMutedRef.current, isVideoOff: isVideoOffRef.current },
            })

            if (userId > p.userId) {
              const offer = await pc.createOffer()
              await pc.setLocalDescription(offer)
              channel.send({
                type: 'broadcast',
                event: 'signal',
                payload: { type: 'offer', from: userId, fromName: userName, to: p.userId, sdp: offer },
              })
            }
          }
        })

        channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
          for (const p of leftPresences as any[]) {
            const peer = peersRef.current.get(p.userId)
            if (peer) { peer.pc.close(); peersRef.current.delete(p.userId) }
          }
          refreshPeers()
        })

        channel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
          if (payload.to && payload.to !== userId) return
          const { type, from, fromName, sdp, candidate } = payload

          if (type === 'offer') {
            let peer = peersRef.current.get(from)
            if (!peer) {
              const pc = createPeerConnection(from)
              peer = { userId: from, name: fromName ?? 'User', stream: null, pc, isMuted: false, isVideoOff: false }
              peersRef.current.set(from, peer)
              refreshPeers()
            }
            await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp))
            const queued = pendingCandidates.current.get(from) ?? []
            for (const c of queued) await peer.pc.addIceCandidate(new RTCIceCandidate(c))
            pendingCandidates.current.delete(from)
            const answer = await peer.pc.createAnswer()
            await peer.pc.setLocalDescription(answer)
            channel.send({
              type: 'broadcast',
              event: 'signal',
              payload: { type: 'answer', from: userId, fromName: userName, to: from, sdp: answer },
            })
          }

          if (type === 'answer') {
            const peer = peersRef.current.get(from)
            if (peer) await peer.pc.setRemoteDescription(new RTCSessionDescription(sdp))
          }

          if (type === 'ice-candidate') {
            const peer = peersRef.current.get(from)
            if (peer?.pc.remoteDescription) {
              await peer.pc.addIceCandidate(new RTCIceCandidate(candidate))
            } else {
              const list = pendingCandidates.current.get(from) ?? []
              list.push(candidate)
              pendingCandidates.current.set(from, list)
            }
          }
        })

        channel.on('broadcast', { event: 'media-state' }, ({ payload }) => {
          const peer = peersRef.current.get(payload.userId)
          if (peer) {
            peer.isMuted = payload.isMuted
            peer.isVideoOff = payload.isVideoOff
            refreshPeers()
          }
        })

        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ userId, name: userName })
            setStatus('connected')
          }
        })
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    }

    init()
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000)

    return () => {
      mounted = false
      clearInterval(timer)
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      peersRef.current.forEach(p => p.pc.close())
      channelRef.current?.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function toggleMute() {
    const audio = localStreamRef.current?.getAudioTracks()[0]
    if (audio) {
      audio.enabled = !audio.enabled
      const newMuted = !audio.enabled
      isMutedRef.current = newMuted
      setIsMuted(newMuted)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'media-state',
        payload: { userId, isMuted: newMuted, isVideoOff: isVideoOffRef.current },
      })
    }
  }

  function toggleVideo() {
    const video = localStreamRef.current?.getVideoTracks()[0]
    if (video) {
      video.enabled = !video.enabled
      const newVideoOff = !video.enabled
      isVideoOffRef.current = newVideoOff
      setIsVideoOff(newVideoOff)
      channelRef.current?.send({
        type: 'broadcast',
        event: 'media-state',
        payload: { userId, isMuted: isMutedRef.current, isVideoOff: newVideoOff },
      })
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  function handleLeave() {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    channelRef.current?.unsubscribe()
    onLeave?.()
  }

  const returnPath = isTeacher ? '/teacher/dashboard' : '/student/sessions'
  const totalParticipants = peers.length + 1

  // Grid columns: mobile always 1 col (vertical stack), desktop adapts to participant count
  const colsClass =
    totalParticipants === 1 ? 'grid-cols-1' :
    totalParticipants === 2 ? 'grid-cols-1 sm:grid-cols-2' :
    'grid-cols-1 sm:grid-cols-3'

  if (status === 'error') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0f172a] px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-5">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Camera access needed</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Allow camera and microphone access in your browser to join the session.
          </p>
          <Link
            href={returnPath}
            className="inline-block w-full bg-white text-slate-900 font-semibold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 h-12 sm:h-14 border-b border-white/5">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold text-white/60 truncate max-w-[140px] sm:max-w-none">{courseName}</span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white text-xs font-semibold">{formatTime(elapsed)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-[#6c4ff5] border border-white/20 flex items-center justify-center text-[9px] font-bold text-white uppercase">
              {userName.charAt(0)}
            </div>
            {peers.map(p => (
              <div key={p.userId} className="w-5 h-5 rounded-full bg-slate-600 border border-white/20 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-white/60 text-xs font-semibold">{totalParticipants}</span>
        </div>
      </div>

      {/* Video grid — flex-1 so it fills remaining height */}
      <div className="flex-1 min-h-0 p-2 sm:p-3 overflow-hidden">
        <div className={`h-full grid gap-2 sm:gap-3 auto-rows-fr ${colsClass}`}>

          {/* Local tile */}
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-800 min-h-0">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#6c4ff5] to-purple-600 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-semibold text-sm px-4 text-center leading-tight">{userName}</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-2 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
              <span className="text-white font-semibold text-xs truncate max-w-[100px]">{userName}</span>
              {isTeacher && <span className="bg-[#6c4ff5] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md">Teacher</span>}
              {isMuted && <span className="text-red-400"><MicOffIcon className="w-3 h-3" /></span>}
            </div>
            {/* Waiting badge — shown inside local tile when alone, no separate grid cell */}
            {peers.length === 0 && (
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full border border-white/10">
                <div className="w-3 h-3 rounded-full border-2 border-dashed border-white/40 animate-spin flex-shrink-0" style={{ animationDuration: '3s' }} />
                <span className="text-white/50 font-semibold text-xs">Waiting for others…</span>
              </div>
            )}
          </div>

          {/* Remote tiles */}
          {peers.map(peer => (
            <RemoteVideo key={peer.userId} peer={peer} />
          ))}
        </div>
      </div>

      {/* Controls bar — fixed at bottom, never overlaps video */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 border-t border-white/5 bg-[#0f172a]/80 backdrop-blur-sm">
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isMuted ? <MicOffIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
            isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {isVideoOff ? <VideoOffIcon className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>

        <div className="w-px h-8 bg-white/10" />

        {onLeave ? (
          <button
            onClick={handleLeave}
            title="Leave session"
            className="w-13 h-13 sm:w-14 sm:h-14 w-[52px] h-[52px] rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all"
          >
            <EndCallIcon className="w-6 h-6" />
          </button>
        ) : (
          <Link
            href={returnPath}
            onClick={() => {
              localStreamRef.current?.getTracks().forEach(t => t.stop())
              channelRef.current?.unsubscribe()
            }}
            title="Leave session"
            className="w-[52px] h-[52px] rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center active:scale-90 transition-all"
          >
            <EndCallIcon className="w-6 h-6" />
          </Link>
        )}
      </div>
    </div>
  )
}

function RemoteVideo({ peer }: { peer: { userId: string; name: string; stream: MediaStream | null; isMuted: boolean; isVideoOff: boolean } }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream
    }
  }, [peer.stream])

  const showOverlay = peer.isVideoOff || !peer.stream
  const isConnecting = !peer.stream

  return (
    <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-slate-800 min-h-0">
      {/* Always render video so stream attaches, but hide it when video is off */}
      {peer.stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transition-opacity duration-300 ${showOverlay ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      {showOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-700 flex items-center justify-center text-2xl sm:text-3xl font-bold text-slate-300 ${isConnecting ? 'animate-pulse' : ''}`}>
            {peer.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-slate-300 font-semibold text-sm px-4 text-center leading-tight">{peer.name}</p>
          {isConnecting && <p className="text-slate-500 font-semibold text-xs">Connecting…</p>}
        </div>
      )}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 flex items-center gap-2 px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
        <span className="text-white font-semibold text-xs truncate max-w-[100px]">{peer.name}</span>
        {peer.isMuted && <span className="text-red-400"><MicOffIcon className="w-3 h-3" /></span>}
      </div>
    </div>
  )
}

/* ── SVG Icons ── */

const MicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
)

const MicOffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" x2="22" y1="2" y2="22"/>
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1"/>
    <path d="M5 10v1a7 7 0 0 0 12 5"/>
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
)

const VideoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 8-6 4 6 4V8Z"/>
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
)

const VideoOffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.66 6H14a2 2 0 0 1 2 2v3.34"/>
    <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h.34"/>
    <path d="m22 8-6 4"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

const EndCallIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)
