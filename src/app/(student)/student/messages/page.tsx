import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getConversations, getStudentChatPartners } from '@/lib/chat/actions'
import { ConversationList } from '@/components/chat/ConversationList'
import { MessagesHeader } from '@/components/chat/MessagesHeader'

export default async function StudentMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [conversations, partners] = await Promise.all([
    getConversations(),
    getStudentChatPartners(),
  ])

  return (
    <div className="flex h-full">
      <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-gray-100 bg-white flex flex-col">
        <MessagesHeader role="student" partners={partners} basePath="/student/messages" />
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            basePath="/student/messages"
          />
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <p className="text-gray-500 font-medium">Select a conversation</p>
          <p className="text-sm text-gray-400 mt-1">Or start a new one with the + button</p>
        </div>
      </div>
    </div>
  )
}
