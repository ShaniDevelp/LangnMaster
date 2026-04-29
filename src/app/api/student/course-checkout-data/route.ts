import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: course }, { data: enrollment }] = await Promise.all([
    supabase.from('courses').select('*').eq('id', id).eq('is_active', true).single(),
    supabase.from('enrollments').select('status, payment_status').eq('user_id', user.id).eq('course_id', id).maybeSingle(),
  ])

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ course, enrollment })
}
