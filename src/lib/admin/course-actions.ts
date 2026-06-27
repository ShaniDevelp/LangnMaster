'use server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CourseInput = {
  name: string
  description: string
  language: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration_weeks: number
  sessions_per_week: number
  max_group_size: number
  price_pkr: number
  thumbnail_url: string | null
  is_active: boolean
  outcomes: string[]
}

export type CurriculumModuleInput = {
  week_number: number
  title: string
  topics: string[]
}

const LEVELS = ['beginner', 'intermediate', 'advanced']

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if ((profile as { role: string } | null)?.role !== 'admin') return { error: 'Unauthorized' as const }
  return { error: undefined }
}

function validate(data: CourseInput): string | null {
  if (!data.name?.trim()) return 'Course name is required.'
  if (!data.description?.trim()) return 'Description is required.'
  if (!data.language?.trim()) return 'Language is required.'
  if (!LEVELS.includes(data.level)) return 'Invalid level.'
  if (!Number.isFinite(data.duration_weeks) || data.duration_weeks < 1) return 'Duration must be at least 1 week.'
  if (!Number.isFinite(data.sessions_per_week) || data.sessions_per_week < 1) return 'Sessions per week must be at least 1.'
  if (!Number.isFinite(data.max_group_size) || data.max_group_size < 1) return 'Max group size must be at least 1.'
  if (!Number.isFinite(data.price_pkr) || data.price_pkr < 0) return 'Price cannot be negative.'
  return null
}

function normalize(data: CourseInput) {
  return {
    name: data.name.trim(),
    description: data.description.trim(),
    language: data.language.trim(),
    level: data.level,
    duration_weeks: Math.round(data.duration_weeks),
    sessions_per_week: Math.round(data.sessions_per_week),
    max_group_size: Math.round(data.max_group_size),
    price_pkr: Math.round(data.price_pkr * 100) / 100,
    thumbnail_url: data.thumbnail_url?.trim() || null,
    is_active: !!data.is_active,
    outcomes: (data.outcomes ?? []).map(o => o.trim()).filter(Boolean),
  }
}

export async function createCourse(data: CourseInput): Promise<{ error?: string; id?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { error: auth.error }

  const invalid = validate(data)
  if (invalid) return { error: invalid }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: row, error } = await (admin as any)
    .from('courses')
    .insert(normalize(data))
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  return { id: row.id }
}

export async function updateCourse(courseId: string, data: CourseInput): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { error: auth.error }

  const invalid = validate(data)
  if (invalid) return { error: invalid }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('courses')
    .update(normalize(data))
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
  return {}
}

export async function setCourseActive(courseId: string, isActive: boolean): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { error: auth.error }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any)
    .from('courses')
    .update({ is_active: isActive })
    .eq('id', courseId)

  if (error) return { error: error.message }
  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
  return {}
}

export async function deleteCourse(courseId: string): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { error: auth.error }

  const admin = createAdminClient()

  // Guard: a course with committed students (assigned/active/completed) or any
  // group can't be deleted — deactivate it instead so it stays hidden from new
  // enrollments without destroying the records of students already on it.
  const [{ count: committedCount }, { count: groupCount }] = await Promise.all([
    admin
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .in('status', ['assigned', 'active', 'completed']),
    admin.from('groups').select('id', { count: 'exact', head: true }).eq('course_id', courseId),
  ])

  if ((committedCount ?? 0) > 0 || (groupCount ?? 0) > 0) {
    return {
      error: `Cannot delete — ${committedCount ?? 0} assigned student(s) and ${groupCount ?? 0} group(s) on this course. Deactivate it instead: existing students keep access and it's hidden from new enrollments.`,
    }
  }

  const { error } = await admin.from('courses').delete().eq('id', courseId)
  if (error) return { error: error.message }

  revalidatePath('/admin/courses')
  return {}
}

// ── Curriculum (course_modules) — replace-all save ────────────────────────────

export async function saveCurriculum(
  courseId: string,
  modules: CurriculumModuleInput[]
): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (auth.error) return { error: auth.error }

  // Clean + validate rows
  const cleaned = modules
    .map(m => ({
      week_number: Math.round(m.week_number),
      title: m.title.trim(),
      topics: (m.topics ?? []).map(t => t.trim()).filter(Boolean),
    }))
    .filter(m => m.title.length > 0)

  if (cleaned.some(m => !Number.isFinite(m.week_number) || m.week_number < 1)) {
    return { error: 'Each week must have a positive week number.' }
  }
  const weeks = cleaned.map(m => m.week_number)
  if (new Set(weeks).size !== weeks.length) {
    return { error: 'Duplicate week numbers — each week must be unique.' }
  }

  const admin = createAdminClient()

  // Replace-all: delete existing modules, insert the new set
  const { error: delErr } = await admin.from('course_modules').delete().eq('course_id', courseId)
  if (delErr) return { error: delErr.message }

  if (cleaned.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insErr } = await (admin as any)
      .from('course_modules')
      .insert(cleaned.map(m => ({ course_id: courseId, ...m })))
    if (insErr) return { error: insErr.message }
  }

  revalidatePath(`/admin/courses/${courseId}`)
  revalidatePath('/admin/courses')
  return {}
}
