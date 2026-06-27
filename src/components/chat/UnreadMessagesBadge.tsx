'use client'
import { useEffect, useState, useCallback, useId, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUnreadMessageCount } from '@/lib/chat/actions'

interface Props {
  userId: string
  dot?: boolean
}

export function UnreadMessagesBadge({ userId, dot }: Props) {
  const [count, setCount] = useState(0)
  const pathname = usePathname()
  const id = useId()
  const activeConvRef = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    const n = await getUnreadMessageCount()
    setCount(n)
  }, [])

  // Re-fetch on navigation (delay so server-side markConversationRead settles first)
  useEffect(() => {
    const t = setTimeout(refresh, 500)
    return () => clearTimeout(t)
  }, [pathname, refresh])

  // Immediate re-fetch when ChatWindow signals a conversation was marked read
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('unread-count-refresh', handler)
    return () => window.removeEventListener('unread-count-refresh', handler)
  }, [refresh])

  // Track which conversation is currently open so we can ignore its notifications
  useEffect(() => {
    const onRead = (e: Event) => { activeConvRef.current = (e as CustomEvent).detail?.conversationId ?? null }
    const onLeft = (e: Event) => {
      if (activeConvRef.current === (e as CustomEvent).detail?.conversationId) activeConvRef.current = null
    }
    window.addEventListener('conversation-read', onRead)
    window.addEventListener('conversation-left', onLeft)
    return () => {
      window.removeEventListener('conversation-read', onRead)
      window.removeEventListener('conversation-left', onLeft)
    }
  }, [])

  // Real-time: new_message notification inserted for this user
  useEffect(() => {
    if (!userId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`unread-badge-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as any
          if (row.type !== 'new_message') return
          // Message arrived for the conversation already open → already seen, skip
          if (row.payload?.conversationId && row.payload.conversationId === activeConvRef.current) return
          refresh()
        }
      )
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [userId, id, refresh])

  if (count <= 0) return null

  if (dot) {
    return <span className="w-2 h-2 rounded-full bg-brand-500 block" />
  }

  return (
    <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center px-1 flex-shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  )
}
