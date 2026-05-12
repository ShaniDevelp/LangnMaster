'use server'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type {
  Conversation,
  ConversationWithMeta,
  Message,
  MessageWithSender,
  MessageType,
} from '@/lib/supabase/types'

const PAGE_SIZE = 50

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return { supabase, user }
}

// ── Unread count ──────────────────────────────────────────────────────────────

export async function getUnreadMessageCount(): Promise<number> {
  const { supabase } = await getUser()
  const { data, error } = await supabase.rpc('get_unread_message_count')
  if (error || data === null) return 0
  return Number(data)
}

// ── Conversations ─────────────────────────────────────────────────────────────

export async function getConversations(): Promise<ConversationWithMeta[]> {
  const { supabase, user } = await getUser()

  // Get all conversations the user is in, with participants + last message
  const { data: participations, error } = await supabase
    .from('conversation_participants')
    .select(`
      last_read_at,
      conversations (
        id,
        type,
        group_id,
        created_at,
        groups ( acceptance_status, courses ( name, language ) ),
        conversation_participants (
          id,
          user_id,
          last_read_at,
          joined_at,
          profiles ( id, name, avatar_url, role )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  if (error || !participations) return []

  // For each conversation, fetch last message + unread count
  const results: ConversationWithMeta[] = []

  for (const p of participations) {
    const conv = p.conversations as any
    if (!conv) continue
    // Skip group conversations whose group is not yet live
    if (conv.type === 'group' && (conv.groups?.acceptance_status === 'pending_teacher' || conv.groups?.acceptance_status === 'declined')) continue

    // Last message
    const { data: lastMsgRows } = await supabase
      .from('messages')
      .select(`
        id, conversation_id, sender_id, type, content, file_url, file_name,
        file_size, mime_type, duration_seconds, reply_to_id, created_at, deleted_at,
        sender:profiles!sender_id ( id, name, avatar_url )
      `)
      .eq('conversation_id', conv.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastMessage = (lastMsgRows?.[0] ?? null) as MessageWithSender | null

    // Unread count: messages after user's last_read_at
    const { count: unread } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .is('deleted_at', null)
      .neq('sender_id', user.id)
      .gt('created_at', p.last_read_at ?? '1970-01-01')

    const groupCourse = conv.groups?.courses
    const groupName = conv.type === 'group' && groupCourse
      ? [groupCourse.name, groupCourse.language].filter(Boolean).join(' · ')
      : null

    results.push({
      id: conv.id,
      type: conv.type,
      group_id: conv.group_id,
      created_at: conv.created_at,
      participants: conv.conversation_participants ?? [],
      last_message: lastMessage,
      unread_count: unread ?? 0,
      group_name: groupName,
    })
  }

  // Sort by last message time (most recent first)
  results.sort((a, b) => {
    const aTime = a.last_message?.created_at ?? a.created_at
    const bTime = b.last_message?.created_at ?? b.created_at
    return bTime.localeCompare(aTime)
  })

  return results
}

export async function getConversation(conversationId: string): Promise<ConversationWithMeta | null> {
  const { supabase, user } = await getUser()

  // Verify user is a participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) return null

  const { data: conv } = await supabase
    .from('conversations')
    .select(`
      id, type, group_id, created_at,
      groups ( acceptance_status, courses ( name, language ) ),
      conversation_participants (
        id, user_id, last_read_at, joined_at,
        profiles ( id, name, avatar_url, role )
      )
    `)
    .eq('id', conversationId)
    .single()

  if (!conv) return null

  const c = conv as any
  // Block access to group conversations not yet live
  if (c.type === 'group' && (c.groups?.acceptance_status === 'pending_teacher' || c.groups?.acceptance_status === 'declined')) return null

  const groupCourse = c.groups?.courses
  const groupName = c.type === 'group' && groupCourse
    ? [groupCourse.name, groupCourse.language].filter(Boolean).join(' · ')
    : null

  return {
    id: c.id,
    type: c.type,
    group_id: c.group_id,
    created_at: c.created_at,
    participants: c.conversation_participants ?? [],
    last_message: null,
    unread_count: 0,
    group_name: groupName,
  }
}

// ── Direct conversation ───────────────────────────────────────────────────────

export async function getOrCreateDirectConversation(
  otherUserId: string
): Promise<{ conversationId: string } | { error: string }> {
  const { supabase, user } = await getUser()
  const admin = createAdminClient()

  if (user.id === otherUserId) return { error: 'Cannot message yourself' }

  // Validate shared group
  const { data: shareCheck } = await supabase
    .rpc('users_share_group', { user_a: user.id, user_b: otherUserId })

  if (!shareCheck) return { error: 'No shared group with this user' }

  // Check if direct conversation already exists between these two
  const { data: existing } = await supabase
    .from('conversation_participants')
    .select('conversation_id, conversations!inner(id, type)')
    .eq('user_id', user.id)

  const myConvIds = (existing ?? []).map((e: any) => e.conversation_id)

  if (myConvIds.length > 0) {
    const { data: shared } = await supabase
      .from('conversation_participants')
      .select('conversation_id, conversations!inner(id, type)')
      .eq('user_id', otherUserId)
      .in('conversation_id', myConvIds)
      .eq('conversations.type', 'direct')

    if (shared && shared.length > 0) {
      return { conversationId: (shared[0] as any).conversation_id }
    }
  }

  // Create new direct conversation
  const { data: newConv, error: convErr } = await admin
    .from('conversations')
    .insert({ type: 'direct' })
    .select('id')
    .single()

  if (convErr || !newConv) return { error: 'Failed to create conversation' }

  const { error: partErr } = await admin
    .from('conversation_participants')
    .insert([
      { conversation_id: newConv.id, user_id: user.id },
      { conversation_id: newConv.id, user_id: otherUserId },
    ])

  if (partErr) return { error: 'Failed to add participants' }

  return { conversationId: newConv.id }
}

// ── Group conversation ────────────────────────────────────────────────────────

export async function getGroupConversationId(
  groupId: string
): Promise<{ conversationId: string } | { error: string }> {
  const { supabase, user } = await getUser()

  // Verify user is in the group (as student or teacher)
  const { data: isMember } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  const { data: isTeacher } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .eq('teacher_id', user.id)
    .single()

  if (!isMember && !isTeacher) return { error: 'Not a member of this group' }

  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('group_id', groupId)
    .eq('type', 'group')
    .single()

  if (!conv) return { error: 'Group conversation not found' }

  return { conversationId: conv.id }
}

// ── Messages ──────────────────────────────────────────────────────────────────

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<{ messages: MessageWithSender[]; hasMore: boolean }> {
  const { supabase, user } = await getUser()

  // Verify participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) return { messages: [], hasMore: false }

  let query = supabase
    .from('messages')
    .select(`
      id, conversation_id, sender_id, type, content, file_url, file_name,
      file_size, mime_type, duration_seconds, reply_to_id, created_at, deleted_at,
      sender:profiles!sender_id ( id, name, avatar_url )
    `)
    .eq('conversation_id', conversationId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error || !data) return { messages: [], hasMore: false }

  const hasMore = data.length > PAGE_SIZE
  const raw = hasMore ? data.slice(0, PAGE_SIZE) : data

  // Fetch reply-to messages separately (self-referential joins are unreliable in PostgREST)
  const replyIds = [...new Set(raw.map((m: any) => m.reply_to_id).filter(Boolean))]
  const replyMap = new Map<string, Pick<Message, 'id' | 'content' | 'type' | 'sender_id'>>()

  if (replyIds.length > 0) {
    const { data: replies } = await supabase
      .from('messages')
      .select('id, content, type, sender_id')
      .in('id', replyIds as string[])
    for (const r of replies ?? []) {
      replyMap.set((r as any).id, r as any)
    }
  }

  const messages: MessageWithSender[] = raw.map((m: any) => ({
    ...m,
    reply_to: m.reply_to_id ? (replyMap.get(m.reply_to_id) ?? null) : null,
  }))

  return { messages: messages.reverse(), hasMore }
}

// ── Send message ──────────────────────────────────────────────────────────────

export type SendMessagePayload = {
  conversationId: string
  type: MessageType
  content?: string
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  durationSeconds?: number
  replyToId?: string
}

export async function sendMessage(
  payload: SendMessagePayload
): Promise<{ message: Message } | { error: string }> {
  const { supabase, user } = await getUser()

  // Verify participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', payload.conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) return { error: 'Not a participant in this conversation' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: payload.conversationId,
      sender_id: user.id,
      type: payload.type,
      content: payload.content ?? null,
      file_url: payload.fileUrl ?? null,
      file_name: payload.fileName ?? null,
      file_size: payload.fileSize ?? null,
      mime_type: payload.mimeType ?? null,
      duration_seconds: payload.durationSeconds ?? null,
      reply_to_id: payload.replyToId ?? null,
    })
    .select()
    .single()

  if (error || !data) return { error: error?.message ?? 'Failed to send message' }

  // Notify other participants
  await notifyParticipants(payload.conversationId, user.id, data as Message)

  return { message: data as Message }
}

// ── Mark read ─────────────────────────────────────────────────────────────────

export async function markConversationRead(
  conversationId: string
): Promise<void> {
  const { supabase, user } = await getUser()

  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
}

// ── Delete message (soft) ─────────────────────────────────────────────────────

export async function deleteMessage(
  messageId: string
): Promise<{ error?: string }> {
  const { supabase, user } = await getUser()

  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('sender_id', user.id)

  if (error) return { error: error.message }
  return {}
}

// ── Student: eligible partners with full group/course context ─────────────────

export type StudentChatPartner = {
  id: string
  name: string
  avatar_url: string | null
  role: 'teacher' | 'student'
  groupId: string
  courseName: string
  courseLanguage: string
  courseLevel: string
  weekStart: string
}

export async function getStudentChatPartners(): Promise<StudentChatPartner[]> {
  const { supabase, user } = await getUser()

  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      group_id,
      groups (
        id, week_start, teacher_id, acceptance_status,
        courses ( name, language, level ),
        profiles:teacher_id ( id, name, avatar_url ),
        group_members ( user_id, profiles ( id, name, avatar_url ) )
      )
    `)
    .eq('user_id', user.id)

  const seen = new Set<string>()
  const result: StudentChatPartner[] = []

  for (const m of memberships ?? []) {
    const group = (m as any).groups
    if (!group) continue
    if (group.acceptance_status === 'pending_teacher') continue

    const course = group.courses
    const courseName: string = course?.name ?? 'Unknown course'
    const courseLanguage: string = course?.language ?? ''
    const courseLevel: string = course?.level ?? ''
    const weekStart: string = group.week_start ?? ''

    // Teacher of this group
    const teacher = group.profiles
    if (teacher && teacher.id !== user.id && !seen.has(teacher.id)) {
      seen.add(teacher.id)
      result.push({
        id: teacher.id,
        name: teacher.name,
        avatar_url: teacher.avatar_url,
        role: 'teacher',
        groupId: group.id,
        courseName,
        courseLanguage,
        courseLevel,
        weekStart,
      })
    }

    // Fellow students
    for (const gm of group.group_members ?? []) {
      const p = gm.profiles
      if (!p || p.id === user.id || seen.has(p.id)) continue
      seen.add(p.id)
      result.push({
        id: p.id,
        name: p.name,
        avatar_url: p.avatar_url,
        role: 'student',
        groupId: group.id,
        courseName,
        courseLanguage,
        courseLevel,
        weekStart,
      })
    }
  }

  // Teachers first, then students
  result.sort((a, b) => {
    if (a.role !== b.role) return a.role === 'teacher' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  return result
}

// ── Teacher: eligible partners grouped by group/course ────────────────────────

export type TeacherGroupPartners = {
  groupId: string
  courseName: string
  courseLanguage: string
  courseLevel: string
  weekStart: string
  students: Array<{
    id: string
    name: string
    avatar_url: string | null
  }>
}

export async function getTeacherChatPartners(): Promise<TeacherGroupPartners[]> {
  const { supabase, user } = await getUser()

  const { data: groups } = await supabase
    .from('groups')
    .select(`
      id, week_start,
      courses ( name, language, level ),
      group_members (
        user_id,
        profiles ( id, name, avatar_url )
      )
    `)
    .eq('teacher_id', user.id)
    .eq('status', 'active')
    .neq('acceptance_status', 'pending_teacher').neq('acceptance_status', 'declined')
    .order('week_start', { ascending: false })

  const result: TeacherGroupPartners[] = []

  for (const g of groups ?? []) {
    const course = (g as any).courses
    const students = ((g as any).group_members ?? [])
      .map((gm: any) => gm.profiles)
      .filter(Boolean)
      .filter((p: any) => p.id !== user.id)

    if (students.length === 0) continue

    result.push({
      groupId: g.id,
      courseName: course?.name ?? 'Unknown course',
      courseLanguage: course?.language ?? '',
      courseLevel: course?.level ?? '',
      weekStart: (g as any).week_start ?? '',
      students,
    })
  }

  return result
}

// ── Group metadata ────────────────────────────────────────────────────────────

export type GroupMeta = {
  courseName: string
  courseLanguage: string
  courseLevel: string
  weekStart: string
  teacherId: string | null
}

export async function getGroupMeta(groupId: string): Promise<GroupMeta | null> {
  const { supabase } = await getUser()

  const { data } = await (supabase as any)
    .from('groups')
    .select('teacher_id, week_start, courses ( name, language, level )')
    .eq('id', groupId)
    .single()

  if (!data) return null
  return {
    courseName: data.courses?.name ?? 'Group Chat',
    courseLanguage: data.courses?.language ?? '',
    courseLevel: data.courses?.level ?? '',
    weekStart: data.week_start ?? '',
    teacherId: data.teacher_id ?? null,
  }
}

// ── Storage: upload attachment ────────────────────────────────────────────────

export async function getUploadSignedUrl(
  conversationId: string,
  fileName: string,
  bucket: 'chat-attachments' | 'chat-voice-notes'
): Promise<{ token: string; path: string } | { error: string }> {
  const { supabase, user } = await getUser()

  // Verify participant
  const { data: participation } = await supabase
    .from('conversation_participants')
    .select('id')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!participation) return { error: 'Not a participant' }

  const path = `${conversationId}/${user.id}/${Date.now()}-${fileName}`
  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(path)

  if (error || !data) return { error: error?.message ?? 'Failed to create upload URL' }

  return { token: data.token, path }
}

export async function getDownloadSignedUrl(
  bucket: 'chat-attachments' | 'chat-voice-notes',
  path: string
): Promise<{ url: string } | { error: string }> {
  const { supabase, user } = await getUser()
  if (!user) return { error: 'Unauthenticated' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1-hour expiry

  if (error || !data) return { error: error?.message ?? 'Failed' }
  return { url: data.signedUrl }
}

// ── Internal: notify other participants ──────────────────────────────────────

async function notifyParticipants(
  conversationId: string,
  senderId: string,
  message: Message
) {
  const admin = createAdminClient()

  const { data: participants } = await admin
    .from('conversation_participants')
    .select('user_id, profiles ( name )')
    .eq('conversation_id', conversationId)
    .neq('user_id', senderId)

  if (!participants?.length) return

  const { data: senderProfile } = await admin
    .from('profiles')
    .select('name')
    .eq('id', senderId)
    .single()

  const preview =
    message.type === 'text'
      ? (message.content ?? '').slice(0, 80)
      : message.type === 'voice_note'
      ? '🎤 Voice note'
      : message.type === 'image'
      ? '🖼 Image'
      : '📎 File'

  const notifications = participants.map((p: any) => ({
    user_id: p.user_id,
    type: 'new_message',
    payload: {
      conversationId,
      messageId: message.id,
      senderName: senderProfile?.name ?? 'Someone',
      preview,
    },
  }))

  await admin.from('notifications').insert(notifications)
}
