'use client'
import { useState, useEffect, useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ConversationWithMeta } from '@/lib/supabase/types'

interface Props {
  conversations: ConversationWithMeta[]
  currentUserId: string
  basePath: string
}

export function ConversationList({ conversations, currentUserId, basePath }: Props) {
  const pathname = usePathname()
  const id = useId()

  // Local unread counts — updated in real-time without server round-trips
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>(() =>
    Object.fromEntries(conversations.map(c => [c.id, c.unread_count]))
  )

  // Latest preview per conversation — updated when new message notification arrives
  const [previewMap, setPreviewMap] = useState<Record<string, { text: string; time: string }>>(() =>
    Object.fromEntries(conversations.map(c => [c.id, {
      text: buildPreview(c, currentUserId),
      time: c.last_message?.created_at ?? c.created_at,
    }]))
  )

  // Real-time: new message notification → increment unread + update preview
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`conv-list-unread-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as any
          if (row.type !== 'new_message') return
          const convId: string = row.payload?.conversationId
          const preview: string = row.payload?.preview ?? ''
          if (!convId) return

          // Only increment if user is NOT currently viewing this conversation
          const isOpen = window.location.pathname.includes(convId)
          if (!isOpen) {
            setUnreadMap(prev => ({ ...prev, [convId]: (prev[convId] ?? 0) + 1 }))
          }

          setPreviewMap(prev => ({
            ...prev,
            [convId]: { text: preview, time: new Date().toISOString() },
          }))
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [currentUserId, id])

  // Conversation opened → zero its unread count immediately
  useEffect(() => {
    function handler(e: Event) {
      const convId: string | undefined = (e as CustomEvent).detail?.conversationId
      if (convId) setUnreadMap(prev => ({ ...prev, [convId]: 0 }))
    }
    window.addEventListener('conversation-read', handler)
    return () => window.removeEventListener('conversation-read', handler)
  }, [])

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-3">
          <span className="text-2xl">💬</span>
        </div>
        <p className="text-sm font-semibold text-gray-700">No conversations</p>
        <p className="text-xs text-gray-400 mt-1">Tap + to start chatting</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {conversations.map(conv => {
        const active = pathname === `${basePath}/${conv.id}`
        const others = conv.participants.filter(p => p.user_id !== currentUserId)
        const isGroup = conv.type === 'group'

        const displayName = isGroup
          ? (conv.group_name ?? 'Group Chat')
          : others[0]?.profiles?.name ?? 'Unknown'

        const avatarName = isGroup ? 'G' : (others[0]?.profiles?.name ?? '?')
        const avatarUrl = isGroup ? null : others[0]?.profiles?.avatar_url ?? null

        const unread = unreadMap[conv.id] ?? 0
        const preview = previewMap[conv.id]
        const isOwnLast = conv.last_message?.sender_id === currentUserId && !preview

        return (
          <Link
            key={conv.id}
            href={`${basePath}/${conv.id}`}
            className={`flex items-center gap-3 mx-2 px-3 py-3 rounded-xl transition-colors ${
              active ? 'bg-brand-50' : 'hover:bg-gray-50'
            }`}
          >
            <ConvAvatar name={avatarName} url={avatarUrl} isGroup={isGroup} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className={`text-sm font-semibold truncate ${active ? 'text-brand-700' : 'text-gray-900'}`}>
                  {displayName}
                </span>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {formatTime(preview?.time ?? conv.last_message?.created_at ?? conv.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs text-gray-500 truncate flex-1">
                  {isOwnLast ? <span className="text-gray-400">You: </span> : null}
                  {preview?.text ?? buildPreview(conv, currentUserId)}
                </p>
                {unread > 0 && (
                  <span className="flex-shrink-0 min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function buildPreview(conv: ConversationWithMeta, currentUserId: string): string {
  const msg = conv.last_message
  if (!msg) return 'No messages yet'
  if (msg.deleted_at) return 'Message deleted'
  const prefix = msg.sender_id === currentUserId ? 'You: ' : ''
  if (msg.type === 'text') return prefix + (msg.content ?? '')
  if (msg.type === 'voice_note') return prefix + '🎤 Voice note'
  if (msg.type === 'image') return prefix + '🖼️ Photo'
  return prefix + '📎 File'
}

function ConvAvatar({ name, url, isGroup }: { name: string; url: string | null; isGroup: boolean }) {
  if (url) {
    return <img src={url} alt={name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
  }
  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white text-base font-bold ${
      isGroup
        ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
        : 'bg-gradient-to-br from-brand-400 to-indigo-500'
    }`}>
      {isGroup ? <span className="text-lg">👥</span> : name.charAt(0).toUpperCase()}
    </div>
  )
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
