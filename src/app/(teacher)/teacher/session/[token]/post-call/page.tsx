import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { PostCallForm } from './PostCallForm'
import type { Session, Group, Course, Profile, GroupMember } from '@/lib/supabase/types'

type SessionRow = Session & {
  session_notes?: string
  homework_text?: string
  homework_url?: string
  topic?: string
  groups: (Group & {
    courses: Pick<Course, 'name' | 'language' | 'level'> | null
    group_members: (GroupMember & { profiles: Pick<Profile, 'id' | 'name'> | null })[]
  }) | null
}

export default async function PostCallPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sessionRaw } = await (supabase as any)
    .from('sessions')
    .select('*, groups(*, courses(name, language, level), profiles:teacher_id(id, name), group_members(*, profiles:user_id(id, name)))')
    .eq('room_token', token)
    .single()

  if (!sessionRaw) notFound()
  const session = sessionRaw as unknown as SessionRow

  if (session.groups?.teacher_id !== user.id) redirect('/teacher/dashboard')

  const students = (session.groups?.group_members ?? [])
    .map(m => ({ id: m.profiles?.id ?? '', name: m.profiles?.name ?? 'Student' }))
    .filter(s => s.id)

  return (
    <PostCallForm
      sessionId={session.id}
      groupId={session.group_id}
      roomToken={token}
      courseName={session.groups?.courses?.name ?? 'Session'}
      language={session.groups?.courses?.language ?? ''}
      scheduledAt={session.scheduled_at}
      students={students}
      existingNotes={(session as unknown as Record<string, string>).session_notes ?? ''}
      existingHomeworkText={(session as unknown as Record<string, string>).homework_text ?? ''}
      existingHomeworkUrl={(session as unknown as Record<string, string>).homework_url ?? ''}
    />
  )
}
