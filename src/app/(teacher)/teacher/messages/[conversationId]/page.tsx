import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { getConversation, getConversations, getMessages, getTeacherChatPartners, getGroupMeta } from '@/lib/chat/actions'
import { ConversationList } from '@/components/chat/ConversationList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { MessagesHeader } from '@/components/chat/MessagesHeader'

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function TeacherChatPage({ params }: Props) {
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

  const [{ messages }, conversations, groups, groupMeta] = await Promise.all([
    getMessages(conversationId),
    getConversations(),
    getTeacherChatPartners(),
    conversation.type === 'group' && conversation.group_id
      ? getGroupMeta(conversation.group_id)
      : Promise.resolve(null),
  ])

  return (
    <div className="flex h-full">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 flex-col border-r border-gray-100 bg-white">
        <MessagesHeader role="teacher" groups={groups} basePath="/teacher/messages" />
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            currentUserId={user.id}
            basePath="/teacher/messages"
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
            backHref="/teacher/messages"
            groupMeta={groupMeta}
          />
        </div>
      </div>
    </div>
  )
}
