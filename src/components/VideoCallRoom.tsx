'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Peer {
  userId: string
  name: string
  stream: MediaStream | null
  pc: RTCPeerConnection
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

const ICE_SERVERS = [
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

  const [peers, setPeers] = useState<{ userId: string; name: string; stream: MediaStream | null }[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())

  const refreshPeers = useCallback(() => {
    setPeers(Array.from(peersRef.current.values()).map(p => ({
      userId: p.userId,
      name: p.name,
      stream: p.stream,
    })))
  }, [])

  const createPeerConnection = useCallback((remoteUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })

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
            peersRef.current.set(p.userId, { userId: p.userId, name: p.name ?? 'User', stream: null, pc })
            refreshPeers()

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
              peer = { userId: from, name: fromName ?? 'User', stream: null, pc }
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
    if (audio) { audio.enabled = !audio.enabled; setIsMuted(!audio.enabled) }
  }

  function toggleVideo() {
    const video = localStreamRef.current?.getVideoTracks()[0]
    if (video) { video.enabled = !video.enabled; setIsVideoOff(!video.enabled) }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  const returnPath = isTeacher ? '/teacher/dashboard' : '/student/sessions'

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Hardware Access Needed</h2>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            We need your camera and microphone to start the lesson. Please check your browser permissions.
          </p>
          <Link href={returnPath} className="inline-block w-full bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl hover:bg-slate-100 transition-all">
            Go Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const totalParticipants = peers.length + 1

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col font-sans overflow-hidden">
      {/* ── Top Glass Header ── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-widest leading-none">
                {courseName}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-white font-bold text-[10px] uppercase tracking-widest">{formatTime(elapsed)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md border border-white/5 px-4 py-1.5 rounded-full">
          <div className="flex -space-x-2">
             <div className="w-6 h-6 rounded-full bg-indigo-600 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg">
              {userName.charAt(0)}
            </div>
            {peers.map(p => (
              <div key={p.userId} className="w-6 h-6 rounded-full bg-slate-700 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-lg">
                {p.name.charAt(0)}
              </div>
            ))}
          </div>
          <span className="text-white/80 font-bold text-[10px] uppercase tracking-widest">
            {totalParticipants} Online
          </span>
        </div>
      </div>

      {/* ── Fluid Video Grid ── */}
      <div className={`flex-1 p-4 flex flex-col items-center justify-center gap-4 transition-all duration-700 ${
        totalParticipants > 2 ? 'grid grid-cols-1 md:grid-cols-2' : 'flex-row'
      }`}>
        {/* Local Participant */}
        <div className={`relative group rounded-[2.5rem] overflow-hidden bg-slate-800/50 border border-white/5 shadow-2xl transition-all duration-500 ${
          totalParticipants === 1 ? 'w-full max-w-4xl aspect-video' : 
          totalParticipants === 2 ? 'flex-1 h-full max-h-[85vh] aspect-[3/4] md:aspect-square' : 
          'w-full h-full'
        }`}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-700 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
          />
          
          {/* Avatar Backup */}
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="w-32 h-32 rounded-[3rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-indigo-500/20">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Label Overlay */}
          <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 transition-all group-hover:scale-105">
            <span className="text-white font-black text-xs uppercase tracking-widest">{userName} (You)</span>
            {isTeacher && <span className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Teacher</span>}
            {isMuted && <MicOffIcon className="w-3 h-3 text-red-400" />}
          </div>
        </div>

        {/* Remote Participants */}
        {peers.map(peer => (
          <RemoteVideo key={peer.userId} peer={peer} layout={totalParticipants} />
        ))}

        {/* Empty State */}
        {peers.length === 0 && (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 animate-spin-slow" />
            <p className="mt-6 text-white font-black text-sm uppercase tracking-[0.3em]">Waiting for student</p>
          </div>
        )}
      </div>

      {/* ── Floating Premium Controls ── */}
      <div className="absolute bottom-10 left-0 right-0 z-50 flex items-center justify-center px-6">
        <div className="flex items-center gap-4 px-8 py-5 bg-[#1e293b]/80 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              isMuted ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              isVideoOff ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {isVideoOff ? <VideoOffIcon className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
          </button>

          <div className="w-px h-8 bg-white/10 mx-2" />

          {onLeave ? (
            <button
              onClick={() => {
                localStreamRef.current?.getTracks().forEach(t => t.stop())
                channelRef.current?.unsubscribe()
                onLeave()
              }}
              className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 active:scale-90 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
            >
              <EndCallIcon className="w-8 h-8" />
            </button>
          ) : (
            <Link
              href={returnPath}
              onClick={() => {
                localStreamRef.current?.getTracks().forEach(t => t.stop())
                channelRef.current?.unsubscribe()
              }}
              className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500 active:scale-90 transition-all shadow-[0_0_30px_rgba(220,38,38,0.4)]"
            >
              <EndCallIcon className="w-8 h-8" />
            </Link>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  )
}

function RemoteVideo({ peer, layout }: { peer: { userId: string; name: string; stream: MediaStream | null }; layout: number }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream
    }
  }, [peer.stream])

  return (
    <div className={`relative group rounded-[2.5rem] overflow-hidden bg-slate-800/50 border border-white/5 shadow-2xl transition-all duration-500 ${
      layout === 2 ? 'flex-1 h-full max-h-[85vh] aspect-[3/4] md:aspect-square' : 'w-full h-full'
    }`}>
      {peer.stream ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
          <div className="w-32 h-32 rounded-[3rem] bg-slate-800 flex items-center justify-center text-4xl font-black text-slate-500 animate-pulse">
            {peer.name.charAt(0).toUpperCase()}
          </div>
          <p className="mt-6 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">Connecting</p>
        </div>
      )}
      
      {/* Label Overlay */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/5 transition-all group-hover:scale-105">
        <span className="text-white font-black text-xs uppercase tracking-widest">{peer.name}</span>
      </div>
    </div>
  )
}

/* ── Minimal SVG Icons ── */

const MicIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
)

const MicOffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 11v-1"/><path d="M5 10v1a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
)

const VideoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
  </svg>
)

const VideoOffIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.66 6H14a2 2 0 0 1 2 2v3.34"/><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h.34"/><path d="m16 12 5 3"/><path d="m22 8-1.5 1"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

const EndCallIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)
