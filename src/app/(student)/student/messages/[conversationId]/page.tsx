import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getConversation, getConversations, getMessages, getStudentChatPartners, getGroupMeta } from '@/lib/chat/actions'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { MessagesHeader } from '@/components/chat/MessagesHeader'

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function StudentChatPage({ params }: Props) {
  const { conversationId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .single()

  const conversation = await getConversation(conversationId)
  if (!conversation) notFound()

  const [{ messages }, conversations, partners, groupMeta] = await Promise.all([
    getMessages(conversationId),
    getConversations(),
    getStudentChatPartners(),
    conversation.type === 'group' && conversation.group_id
      ? getGroupMeta(conversation.group_id)
      : Promise.resolve(null),
  ])

  return (
    <div className="flex h-full">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
        <MessagesHeader role="student" partners={partners} basePath="/student/messages" />
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            basePath="/student/messages"
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <div className="flex-1 min-h-0">
          <ChatWindow
            conversation={conversation}
            initialMessages={messages}
            currentUserId={user.id}
            currentUserName={profile?.name ?? 'You'}
            backHref="/student/messages"
            groupMeta={groupMeta}
          />
        </div>
      </div>
    </div>
  )
}
