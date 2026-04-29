import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { VideoCallRoom } from '@/components/VideoCallRoom'
import type { Session, Group, Course, Profile } from '@/lib/supabase/types'

type SessionWithGroup = Session & {
  groups: (Group & {
    courses: Pick<Course, 'name'> | null
    profiles: Pick<Profile, 'id' | 'name'> | null
  }) | null
}

export default async function StudentSessionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessionRaw } = await supabase
    .from('sessions')
    .select('*, groups(*, courses(name), profiles:teacher_id(id, name))')
    .eq('room_token', token)
    .single()

  if (!sessionRaw) notFound()
  const session = sessionRaw as unknown as SessionWithGroup

  const { data: membershipRaw } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', session.group_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membershipRaw) redirect('/student/sessions')

  const { data: profileRaw } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null

  return (
    <VideoCallRoom
      roomToken={token}
      sessionId={session.id}
      userId={user.id}
      userName={profile?.name ?? 'Student'}
      courseName={session.groups?.courses?.name ?? 'Session'}
    />
  )
}
