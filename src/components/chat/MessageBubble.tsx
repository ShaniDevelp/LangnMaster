'use client'
import { useState, useEffect, useRef } from 'react'
import type { MessageWithSender } from '@/lib/supabase/types'
import { AudioPlayer } from './AudioPlayer'
import { deleteMessage, getDownloadSignedUrl } from '@/lib/chat/actions'

interface Props {
  message: MessageWithSender
  isOwn: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
  isRead: boolean
  onReply: (msg: MessageWithSender) => void
  onDelete: (messageId: string) => void
}

export function MessageBubble({ message, isOwn, isFirstInGroup, isLastInGroup, isRead, onReply, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  if (message.deleted_at) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4`}>
        <span className="text-xs text-gray-400 italic px-3 py-1 bg-gray-100 rounded-lg">Message deleted</span>
      </div>
    )
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteMessage(message.id)
    onDelete(message.id)
    setDeleting(false)
    setMenuOpen(false)
  }

  // WhatsApp corner style: tail-side corner is nearly sharp on first bubble, rest fully rounded
  const ownRadius = isFirstInGroup
    ? 'rounded-tl-2xl rounded-bl-2xl rounded-br-2xl rounded-tr-[5px]'
    : 'rounded-2xl'
  const otherRadius = isFirstInGroup
    ? 'rounded-tr-2xl rounded-bl-2xl rounded-br-2xl rounded-tl-[5px]'
    : 'rounded-2xl'

  return (
    <div className={`flex gap-2 px-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isLastInGroup ? 'mb-2' : 'mb-[2px]'}`}>

      {/* Avatar or spacer — keeps received bubbles aligned */}
      <div className="w-7 flex-shrink-0 self-end">
        {!isOwn && isLastInGroup ? (
          <AvatarSmall name={message.sender?.name ?? '?'} url={message.sender?.avatar_url ?? null} />
        ) : !isOwn ? (
          <div className="w-7" />
        ) : null}
      </div>

      <div className={`flex flex-col max-w-[78%] sm:max-w-[62%] ${isOwn ? 'items-end' : 'items-start'}`}>

        {/* Bubble with inline dropdown trigger */}
        <div ref={menuRef} className="relative group">

          {/* Dropdown trigger — floats at top corner, visible on hover/tap */}
          <button
            onClick={() => setMenuOpen(v => !v)}
            className={`absolute -top-2.5 z-10 h-5 px-1.5 rounded-full flex items-center gap-0.5
              bg-white border border-gray-200 shadow-sm text-gray-400
              transition-opacity duration-150
              ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}
              ${isOwn ? 'left-1' : 'right-1'}`}
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L1 3h10z"/>
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div className={`absolute top-3 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[120px]
              ${isOwn ? 'left-0' : 'right-0'}`}
            >
              <button
                onClick={() => { onReply(message); setMenuOpen(false) }}
                className="w-full text-left px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium flex items-center gap-2"
              >
                <span className="text-base">↩</span> Reply
              </button>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full text-left px-3.5 py-2 text-sm text-red-500 hover:bg-red-50 active:bg-red-100 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <span className="text-base">🗑</span> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          )}

          {/* Bubble */}
          <div className={`px-3 py-2 ${isOwn
            ? `${ownRadius} bg-brand-500 text-white`
            : `${otherRadius} bg-white text-gray-900 shadow-sm`
          }`}>

            {/* Sender name — group chats, non-own, first bubble */}
            {!isOwn && isFirstInGroup && message.sender && (
              <p className="text-[11px] font-bold text-brand-500 mb-1 leading-none">{message.sender.name}</p>
            )}

            {/* Reply context */}
            {message.reply_to_id && message.reply_to?.id && (
              <div className={`text-xs px-2.5 py-1.5 rounded-lg mb-1.5 border-l-[3px] ${
                isOwn
                  ? 'bg-brand-600/40 border-white/70 text-brand-100'
                  : 'bg-gray-100 border-brand-400 text-gray-500'
              }`}>
                <p className="font-semibold text-[10px] mb-0.5 opacity-80">
                  {message.reply_to.type === 'text'
                    ? (message.reply_to.content ?? 'Message')
                    : message.reply_to.type === 'voice_note' ? '🎤 Voice note'
                    : message.reply_to.type === 'image' ? '🖼️ Image'
                    : '📎 File'}
                </p>
              </div>
            )}

            {/* Message content */}
            <MessageContent message={message} isOwn={isOwn} />

            {/* Timestamp + ticks — inside bubble, bottom-right */}
            <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
              <span className={`text-[10px] whitespace-nowrap ${isOwn ? 'text-brand-200' : 'text-gray-400'}`}>
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                isRead ? (
                  // Double tick — seen
                  <svg className="w-[14px] h-[9px] text-brand-200 flex-shrink-0" viewBox="0 0 16 11" fill="currentColor">
                    <path d="M11.071.653a.75.75 0 0 1 .025 1.06L5.81 7.39a.75.75 0 0 1-1.085 0L2.003 4.698a.75.75 0 0 1 1.085-1.038l2.18 2.27 4.743-5.252a.75.75 0 0 1 1.06-.025zM14.671.653a.75.75 0 0 1 .025 1.06L9.41 7.39a.75.75 0 0 1-1.085 0l-.5-.521a.75.75 0 0 1 1.085-1.038l.458.477 4.743-5.252a.75.75 0 0 1 1.06-.025z"/>
                  </svg>
                ) : (
                  // Single tick — sent, not yet seen
                  <svg className="w-[10px] h-[9px] text-brand-200 flex-shrink-0" viewBox="0 0 10 11" fill="currentColor">
                    <path d="M8.571.653a.75.75 0 0 1 .025 1.06L3.31 7.39a.75.75 0 0 1-1.085 0L.003 4.698a.75.75 0 0 1 1.085-1.038l1.68 1.752 4.743-5.734a.75.75 0 0 1 1.06-.025z"/>
                  </svg>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function useSignedUrl(raw: string | null, bucket: 'chat-attachments' | 'chat-voice-notes') {
  const [url, setUrl] = useState<string | null>(raw)
  useEffect(() => {
    if (!raw) return
    if (raw.startsWith('http')) { setUrl(raw); return }
    getDownloadSignedUrl(bucket, raw).then(r => { if ('url' in r) setUrl(r.url) })
  }, [raw, bucket])
  return url
}

function MessageContent({ message, isOwn }: { message: MessageWithSender; isOwn: boolean }) {
  const attachmentUrl = useSignedUrl(
    message.type !== 'voice_note' ? (message.file_url ?? null) : null,
    'chat-attachments'
  )
  const voiceUrl = useSignedUrl(
    message.type === 'voice_note' ? (message.file_url ?? null) : null,
    'chat-voice-notes'
  )

  if (message.type === 'text') {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
  }

  if (message.type === 'voice_note') {
    return (
      <AudioPlayer
        fileUrl={voiceUrl ?? ''}
        durationSeconds={message.duration_seconds ?? 0}
        isOwn={isOwn}
      />
    )
  }

  if (message.type === 'image') {
    if (!attachmentUrl) return <span className="text-xs text-gray-400">Loading…</span>
    return (
      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={attachmentUrl}
          alt={message.file_name ?? 'Image'}
          className="max-w-[240px] max-h-[240px] rounded-xl object-cover"
        />
      </a>
    )
  }

  if (!attachmentUrl) return <span className="text-xs text-gray-400">Loading…</span>
  return (
    <a
      href={attachmentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 min-w-[160px] ${isOwn ? 'text-white' : 'text-gray-900'}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
        isOwn ? 'bg-brand-600' : 'bg-brand-50'
      }`}>
        {fileIcon(message.mime_type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{message.file_name ?? 'File'}</p>
        {message.file_size && (
          <p className={`text-[11px] ${isOwn ? 'text-brand-200' : 'text-gray-400'}`}>
            {formatBytes(message.file_size)}
          </p>
        )}
      </div>
    </a>
  )
}

function AvatarSmall({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt={name} className="w-7 h-7 rounded-full object-cover" />
  return (
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function fileIcon(mime: string | null): string {
  if (!mime) return '📎'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime === 'application/pdf') return '📄'
  if (mime.includes('word')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  if (mime.includes('zip') || mime.includes('rar')) return '🗜️'
  return '📎'
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
