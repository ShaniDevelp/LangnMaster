'use client'
import { useRef, useState } from 'react'
import { VoiceRecorder } from './VoiceRecorder'
import { FileUploadButton } from './FileUploadButton'
import { sendMessage, getDownloadSignedUrl } from '@/lib/chat/actions'
import type { MessageWithSender } from '@/lib/supabase/types'

interface Props {
  conversationId: string
  currentUserId: string
  currentUserName: string
  replyTo: MessageWithSender | null
  onCancelReply: () => void
  onMessageSent: (msg: MessageWithSender) => void
  onTyping: (name: string) => void
  onBroadcast: (msg: MessageWithSender) => void
}

export function MessageInput({
  conversationId,
  currentUserId,
  currentUserName,
  replyTo,
  onCancelReply,
  onMessageSent,
  onTyping,
  onBroadcast,
}: Props) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0 && !sending

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
    autoResize()
    onTyping(currentUserName)
  }

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const optimistic: MessageWithSender = {
      id: `opt-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      type: 'text',
      content: trimmed,
      file_url: null, file_name: null, file_size: null,
      mime_type: null, duration_seconds: null,
      reply_to_id: replyTo?.id ?? null,
      created_at: new Date().toISOString(),
      deleted_at: null,
      sender: null,
      reply_to: replyTo
        ? { id: replyTo.id, content: replyTo.content, type: replyTo.type, sender_id: replyTo.sender_id }
        : null,
    }
    onMessageSent(optimistic)
    onCancelReply()

    const result = await sendMessage({ conversationId, type: 'text', content: trimmed, replyToId: replyTo?.id })
    setSending(false)
    if ('message' in result) {
      // Broadcast to other participants with real DB id + timestamp
      onBroadcast({ ...result.message, sender: null, reply_to: optimistic.reply_to })
    }
  }

  async function handleVoiceRecorded(filePath: string, durationSeconds: number) {
    const signed = await getDownloadSignedUrl('chat-voice-notes', filePath)
    const url = 'url' in signed ? signed.url : filePath
    const optimistic: MessageWithSender = {
      id: `opt-${Date.now()}`, conversation_id: conversationId,
      sender_id: currentUserId, type: 'voice_note', content: null,
      file_url: url, file_name: null, file_size: null,
      mime_type: 'audio/webm', duration_seconds: durationSeconds,
      reply_to_id: null, created_at: new Date().toISOString(), deleted_at: null,
      sender: null, reply_to: null,
    }
    onMessageSent(optimistic)
    const result = await sendMessage({ conversationId, type: 'voice_note', fileUrl: filePath, durationSeconds })
    if ('message' in result) onBroadcast({ ...result.message, sender: null, reply_to: null })
  }

  async function handleFileUploaded(result: {
    fileUrl: string; fileName: string; fileSize: number; mimeType: string; isImage: boolean
  }) {
    const signed = await getDownloadSignedUrl('chat-attachments', result.fileUrl)
    const url = 'url' in signed ? signed.url : result.fileUrl
    const type = result.isImage ? 'image' : 'file'
    const optimistic: MessageWithSender = {
      id: `opt-${Date.now()}`, conversation_id: conversationId,
      sender_id: currentUserId, type,
      content: null, file_url: url, file_name: result.fileName,
      file_size: result.fileSize, mime_type: result.mimeType, duration_seconds: null,
      reply_to_id: null, created_at: new Date().toISOString(), deleted_at: null,
      sender: null, reply_to: null,
    }
    onMessageSent(optimistic)
    const dbResult = await sendMessage({ conversationId, type, fileUrl: result.fileUrl, fileName: result.fileName, fileSize: result.fileSize, mimeType: result.mimeType })
    if ('message' in dbResult) onBroadcast({ ...dbResult.message, sender: null, reply_to: null })
  }

  return (
    <div className="bg-white border-t border-gray-100 shadow-[0_-1px_0_0_rgba(0,0,0,0.04)]">
      {/* Reply bar */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-brand-50 border-b border-brand-100">
          <div className="w-0.5 h-8 bg-brand-400 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-brand-600 mb-0.5">
              Reply to {replyTo.sender?.name ?? 'message'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {replyTo.type === 'text' ? replyTo.content : `${replyTo.type} message`}
            </p>
          </div>
          <button onClick={onCancelReply} className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-brand-100 transition-colors text-lg leading-none flex-shrink-0">
            ×
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 px-3 py-2.5">
        <FileUploadButton
          conversationId={conversationId}
          onUploaded={handleFileUploaded}
          disabled={sending}
        />

        <div className="flex-1 bg-gray-100 rounded-2xl px-3.5 py-2 flex items-end min-h-[40px]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            disabled={sending}
            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 resize-none outline-none leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
        </div>

        {canSend ? (
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current translate-x-0.5">
              <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        ) : (
          <VoiceRecorder
            conversationId={conversationId}
            onRecorded={handleVoiceRecorded}
            disabled={sending}
          />
        )}
      </div>
    </div>
  )
}
