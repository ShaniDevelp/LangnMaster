'use client'
import { useEffect, useRef, useState } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { GroupInfoPanel } from './GroupInfoPanel'
import { getMessages, markConversationRead } from '@/lib/chat/actions'
import type { GroupMeta } from '@/lib/chat/actions'
import type { ConversationWithMeta, MessageWithSender } from '@/lib/supabase/types'

interface Props {
  conversation: ConversationWithMeta
  initialMessages: MessageWithSender[]
  currentUserId: string
  currentUserName: string
  backHref?: string
  groupMeta?: GroupMeta | null
}

export function ChatWindow({ conversation, initialMessages, currentUserId, currentUserName, backHref, groupMeta }: Props) {
  const initialOtherReadAt = conversation.participants
    .filter(p => p.user_id !== currentUserId)
    .reduce((max, p) => (!max || p.last_read_at > max ? p.last_read_at : max), null as string | null)

  const {
    messages,
    typingUsers,
    onlineUsers,
    otherReadAt,
    appendMessage,
    prependMessages,
    removeMessage,
    setTyping,
    broadcastRead,
    broadcastNewMessage,
    broadcastDelete,
  } = useConversation(conversation.id, currentUserId, initialMessages, initialOtherReadAt)

  function handleDelete(messageId: string) {
    removeMessage(messageId)
    broadcastDelete(messageId)
  }

  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialMessages.length >= 50)
  const [infoOpen, setInfoOpen] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  const isGroup = conversation.type === 'group'
  const others = conversation.participants.filter(p => p.user_id !== currentUserId)
  const otherProfile = others[0]?.profiles

  const displayName = isGroup
    ? (groupMeta?.courseName ?? conversation.group_name ?? 'Group Chat')
    : otherProfile?.name ?? 'Unknown'

  const statusLine = isGroup
    ? `${conversation.participants.length} members${onlineUsers.size > 1 ? ` · ${onlineUsers.size} online` : ''}`
    : onlineUsers.has(others[0]?.user_id ?? '')
    ? 'Online'
    : otherProfile?.role === 'teacher' ? 'Teacher' : 'Student'

  const isOnline = !isGroup && onlineUsers.has(others[0]?.user_id ?? '')

  // First load scroll
  useEffect(() => {
    if (isFirstLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
      isFirstLoad.current = false
    }
  }, [])

  // Scroll to bottom on own new message
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last?.sender_id === currentUserId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, currentUserId])

  // Mark read on mount
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('conversation-read', { detail: { conversationId: conversation.id } }))
    markConversationRead(conversation.id).then(() => {
      window.dispatchEvent(new Event('unread-count-refresh'))
    })
    broadcastRead()
  }, [conversation.id])

  async function loadMore() {
    if (loadingMore || !hasMore || messages.length === 0) return
    setLoadingMore(true)
    const prevHeight = containerRef.current?.scrollHeight ?? 0
    const { messages: older, hasMore: more } = await getMessages(conversation.id, messages[0].created_at)
    prependMessages(older)
    setHasMore(more)
    setLoadingMore(false)
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight - prevHeight
      }
    })
  }

  function isFirstInGroup(i: number) {
    const prev = messages[i - 1]
    return !prev || prev.sender_id !== messages[i].sender_id
  }
  function isLastInGroup(i: number) {
    const next = messages[i + 1]
    return !next || next.sender_id !== messages[i].sender_id
  }

  function dayLabel(iso: string) {
    const d = new Date(iso)
    const today = new Date()
    const diff = Math.floor((today.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  }
  function showDaySeparator(i: number) {
    if (i === 0) return true
    const prev = new Date(messages[i - 1].created_at).toDateString()
    const curr = new Date(messages[i].created_at).toDateString()
    return prev !== curr
  }

  const teacherId = groupMeta?.teacherId ?? null

  return (
    <div className="flex flex-row h-full bg-gray-50 relative">

      {/* ── Main chat column ─────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Header */}
        <div className="flex items-center gap-3 px-3 sm:px-4 h-16 bg-white border-b border-gray-100 flex-shrink-0 shadow-sm">
          {backHref && (
            <a
              href={backHref}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex-shrink-0"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </a>
          )}
          <HeaderAvatar name={displayName} url={otherProfile?.avatar_url ?? null} isGroup={isGroup} isOnline={isOnline} />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-gray-900 leading-tight truncate">{displayName}</h2>
            <p className={`text-xs font-medium leading-tight mt-0.5 ${isOnline ? 'text-emerald-500' : 'text-gray-400'}`}>
              {statusLine}
            </p>
          </div>
          {/* Group info toggle */}
          {isGroup && (
            <button
              onClick={() => setInfoOpen(o => !o)}
              className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
                infoOpen ? 'bg-brand-50 text-brand-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              }`}
              title="Group info"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto py-4"
          onScroll={e => { if ((e.currentTarget as HTMLDivElement).scrollTop < 80) loadMore() }}
        >
          {hasMore && (
            <div className="flex justify-center pb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="text-xs text-brand-500 hover:text-brand-600 font-semibold bg-white border border-gray-200 px-4 py-1.5 rounded-full shadow-sm disabled:opacity-50 transition-colors"
              >
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </button>
            </div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-3 text-2xl">
                👋
              </div>
              <p className="text-sm font-semibold text-gray-700">Say hello!</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation below</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={msg.id}>
              {showDaySeparator(i) && (
                <div className="flex items-center gap-3 px-6 py-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] font-semibold text-gray-400">{dayLabel(msg.created_at)}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              )}
              <MessageBubble
                message={msg}
                isOwn={msg.sender_id === currentUserId}
                isFirstInGroup={isFirstInGroup(i)}
                isLastInGroup={isLastInGroup(i)}
                isRead={
                  msg.sender_id === currentUserId &&
                  !!otherReadAt &&
                  msg.created_at <= otherReadAt
                }
                onReply={setReplyTo}
                onDelete={handleDelete}
              />
            </div>
          ))}

          <TypingIndicator users={typingUsers} />
          <div ref={bottomRef} className="h-2" />
        </div>

        {/* Input */}
        <div className="flex-shrink-0">
          <MessageInput
            conversationId={conversation.id}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onMessageSent={appendMessage}
            onTyping={setTyping}
            onBroadcast={broadcastNewMessage}
          />
        </div>
      </div>

      {/* ── Group info panel ─────────────────────────────────── */}
      {isGroup && infoOpen && groupMeta && (
        <GroupInfoPanel
          groupMeta={groupMeta}
          participants={conversation.participants as any}
          teacherId={teacherId}
          onlineUsers={onlineUsers}
          onClose={() => setInfoOpen(false)}
        />
      )}
    </div>
  )
}

function HeaderAvatar({ name, url, isGroup, isOnline }: {
  name: string; url: string | null; isGroup: boolean; isOnline: boolean
}) {
  return (
    <div className="relative flex-shrink-0">
      {url ? (
        <img src={url} alt={name} className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
          isGroup ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-brand-400 to-indigo-500'
        }`}>
          {isGroup ? '👥' : name.charAt(0).toUpperCase()}
        </div>
      )}
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
      )}
    </div>
  )
}
