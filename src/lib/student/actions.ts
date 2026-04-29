'use server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function enrollInCourse(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const courseId = formData.get('courseId') as string

  await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId, status: 'pending' })

  redirect('/student/dashboard')
}
