'use client'
import type { TypingUser } from '@/hooks/useConversation'

export function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null

  const label =
    users.length === 1 ? `${users[0].name} is typing`
    : users.length === 2 ? `${users[0].name} & ${users[1].name} are typing`
    : 'Several people are typing'

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2">
        <span className="flex items-center gap-0.5 h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </span>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
    </div>
  )
}
