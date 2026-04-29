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
  const [participantCount, setParticipantCount] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())

  const refreshPeers = useCallback(() => {
    setPeers(Array.from(peersRef.current.values()).map(p => ({
      userId: p.userId,
      name: p.name,
      stream: p.stream,
    })))
    setParticipantCount(peersRef.current.size + 1)
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

            // Initiator: the one who joined later creates the offer
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="text-center text-white">
          <p className="text-4xl mb-4">🚫</p>
          <h2 className="text-xl font-bold mb-2">Camera/mic access required</h2>
          <p className="text-gray-400 text-sm mb-6">Allow browser access to camera and microphone to join the session.</p>
          <Link href={returnPath} className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-xl">
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40">
        <div>
          <p className="text-white font-semibold text-sm">{courseName}</p>
          <p className="text-gray-400 text-xs">{participantCount} participant{participantCount !== 1 ? 's' : ''} · {formatTime(elapsed)}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
          <span className="text-xs text-gray-300">{status === 'connected' ? 'Live' : 'Connecting…'}</span>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-3 grid gap-3 overflow-hidden" style={{
        gridTemplateColumns: peers.length === 0 ? '1fr' : peers.length === 1 ? '1fr 1fr' : 'repeat(2, 1fr)',
        gridTemplateRows: peers.length <= 1 ? '1fr' : peers.length === 2 ? '1fr 1fr' : 'repeat(2, 1fr)',
        maxHeight: 'calc(100vh - 160px)',
      }}>
        {/* Local video */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-800">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : ''}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
            {userName} (You){isTeacher ? ' 👨‍🏫' : ''}
          </div>
          {isMuted && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-lg">🔇</div>
          )}
        </div>

        {/* Remote peers */}
        {peers.map(peer => (
          <RemoteVideo key={peer.userId} peer={peer} />
        ))}

        {/* Empty slots */}
        {peers.length === 0 && (
          <div className="rounded-2xl bg-gray-800 flex flex-col items-center justify-center text-gray-500">
            <p className="text-3xl mb-2">⏳</p>
            <p className="text-sm">Waiting for others…</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="h-24 flex items-center justify-center gap-4 bg-black/40 pb-safe px-4">
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
            isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isMuted ? '🔇' : '🎙️'}
        </button>

        <button
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition-all ${
            isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isVideoOff ? '📵' : '📹'}
        </button>

        {onLeave ? (
          <button
            onClick={() => {
              localStreamRef.current?.getTracks().forEach(t => t.stop())
              channelRef.current?.unsubscribe()
              onLeave()
            }}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl text-white hover:bg-red-600 transition-colors"
          >
            📵
          </button>
        ) : (
          <Link
            href={returnPath}
            className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center text-xl text-white hover:bg-red-600 transition-colors"
            onClick={() => {
              localStreamRef.current?.getTracks().forEach(t => t.stop())
              channelRef.current?.unsubscribe()
            }}
          >
            📵
          </Link>
        )}
      </div>
    </div>
  )
}

function RemoteVideo({ peer }: { peer: { userId: string; name: string; stream: MediaStream | null } }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream
    }
  }, [peer.stream])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-800">
      {peer.stream ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-2">
            {peer.name.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs text-gray-400">Connecting…</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
        {peer.name}
      </div>
    </div>
  )
}
