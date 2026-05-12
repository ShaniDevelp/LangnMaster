'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getOrCreateDirectConversation } from '@/lib/chat/actions'

interface Props {
  userId: string
  basePath: string
  label?: string
  className?: string
}

export function MessageButton({ userId, basePath, label = 'Message', className }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await getOrCreateDirectConversation(userId)
      if ('conversationId' in result) {
        router.push(`${basePath}/${result.conversationId}`)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={className ?? 'inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50'}
    >
      {isPending ? (
        <span className="w-3 h-3 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      {isPending ? 'Opening…' : label}
    </button>
  )
}
