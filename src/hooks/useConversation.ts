'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MessageWithSender } from '@/lib/supabase/types'

export type TypingUser = {
  userId: string
  name: string
}

export function useConversation(
  conversationId: string | null,
  currentUserId: string,
  initialMessages: MessageWithSender[] = [],
  initialOtherReadAt: string | null = null
) {
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [otherReadAt, setOtherReadAt] = useState<string | null>(initialOtherReadAt)

  const appendMessage = useCallback((msg: MessageWithSender) => {
    setMessages(prev => {
      // Replace matching optimistic message (same sender + content within 5s) or skip duplicate id
      const optIdx = prev.findIndex(
        m =>
          m.id.startsWith('opt-') &&
          m.sender_id === msg.sender_id &&
          m.type === msg.type &&
          Math.abs(new Date(m.created_at).getTime() - new Date(msg.created_at).getTime()) < 5000
      )
      if (optIdx !== -1) {
        const next = [...prev]
        next[optIdx] = msg
        return next
      }
      if (prev.some(m => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  const prependMessages = useCallback((older: MessageWithSender[]) => {
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id))
      const deduped = older.filter(m => !existingIds.has(m.id))
      return [...deduped, ...prev]
    })
  }, [])

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev =>
      prev.map(m => m.id === messageId ? { ...m, deleted_at: new Date().toISOString() } : m)
    )
  }, [])

  // ── Typing ────────────────────────────────────────────────────────────────────

  const sendTyping = useCallback((isTyping: boolean, userName: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, name: userName, typing: isTyping },
    })
  }, [currentUserId])

  const setTyping = useCallback((userName: string) => {
    sendTyping(true, userName)
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => sendTyping(false, userName), 2000)
  }, [sendTyping])

  // ── Read receipt ──────────────────────────────────────────────────────────────

  const broadcastRead = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'read',
      payload: { userId: currentUserId, timestamp: new Date().toISOString() },
    })
  }, [currentUserId])

  // ── Broadcast new message (called by sender after DB insert) ─────────────────
  // Receiver picks this up instantly without relying on postgres_changes + RLS

  const broadcastNewMessage = useCallback((msg: MessageWithSender) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'new_message',
      payload: { message: msg },
    })
  }, [])

  const broadcastDelete = useCallback((messageId: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'delete_message',
      payload: { messageId },
    })
  }, [])

  // ── Channel setup ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!conversationId) return
    setMessages(initialMessages)

    const channel = supabase.channel(`chat:${conversationId}`, {
      config: { broadcast: { self: false } },
    })
    channelRef.current = channel

    // Primary: broadcast from sender → instant delivery
    channel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
      const msg = payload.message as MessageWithSender
      if (msg.sender_id === currentUserId) return // own message already optimistic
      appendMessage(msg)
    })

    // Secondary: postgres_changes as fallback (catches missed broadcasts, page reloads)
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const raw = payload.new as any
        if (raw.sender_id === currentUserId) return

        // Only fire if broadcast didn't already deliver it
        setMessages(prev => {
          if (prev.some(m => m.id === raw.id)) return prev
          // Fetch sender async and append
          supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('id', raw.sender_id ?? '')
            .single()
            .then(({ data: sender }) => {
              appendMessage({ ...raw, sender: sender ?? null, reply_to: null })
            })
          return prev // return unchanged; appendMessage will update
        })
      }
    )

    // Soft-delete via postgres_changes UPDATE
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const updated = payload.new as any
        if (updated.deleted_at) removeMessage(updated.id)
      }
    )

    // Typing indicators
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const { userId, name, typing } = payload as { userId: string; name: string; typing: boolean }
      if (userId === currentUserId) return
      setTypingUsers(prev =>
        typing
          ? prev.some(u => u.userId === userId) ? prev : [...prev, { userId, name }]
          : prev.filter(u => u.userId !== userId)
      )
    })

    // Delete broadcast
    channel.on('broadcast', { event: 'delete_message' }, ({ payload }) => {
      removeMessage(payload.messageId as string)
    })

    // Read receipts — track latest read timestamp from other participants
    channel.on('broadcast', { event: 'read' }, ({ payload }) => {
      const { userId, timestamp } = payload as { userId: string; timestamp: string }
      if (userId === currentUserId) return
      setOtherReadAt(prev => (!prev || timestamp > prev ? timestamp : prev))
    })

    // Presence → online status
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        newPresences.forEach((p: any) => next.add(p.user_id))
        return next
      })
    })
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        leftPresences.forEach((p: any) => next.delete(p.user_id))
        return next
      })
    })

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ user_id: currentUserId })
      }
    })

    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, currentUserId])

  return {
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
  }
}
