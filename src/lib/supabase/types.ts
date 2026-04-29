export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          role: 'student' | 'teacher' | 'admin'
          bio: string | null
          avatar_url: string | null
          languages: string[] | null
          created_at: string
          native_lang: string | null
          target_langs: string[] | null
          levels: Record<string, string> | null
          timezone: string | null
          availability: string[] | null
          goals: string[] | null
          onboarding_completed: boolean | null
        }
        Insert: {
          id: string
          name: string
          role: 'student' | 'teacher' | 'admin'
          bio?: string | null
          avatar_url?: string | null
          languages?: string[] | null
          created_at?: string
          native_lang?: string | null
          target_langs?: string[] | null
          levels?: Record<string, string> | null
          timezone?: string | null
          availability?: string[] | null
          goals?: string[] | null
          onboarding_completed?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          role?: 'student' | 'teacher' | 'admin'
          bio?: string | null
          avatar_url?: string | null
          languages?: string[] | null
          created_at?: string
          native_lang?: string | null
          target_langs?: string[] | null
          levels?: Record<string, string> | null
          timezone?: string | null
          availability?: string[] | null
          goals?: string[] | null
          onboarding_completed?: boolean | null
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          description: string
          language: string
          level: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks: number
          sessions_per_week: number
          max_group_size: number
          price_usd: number
          thumbnail_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          language: string
          level: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks: number
          sessions_per_week?: number
          max_group_size?: number
          price_usd?: number
          thumbnail_url?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          language?: string
          level?: 'beginner' | 'intermediate' | 'advanced'
          duration_weeks?: number
          sessions_per_week?: number
          max_group_size?: number
          price_usd?: number
          thumbnail_url?: string | null
          is_active?: boolean
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled'
          enrolled_at: string
          payment_status: 'unpaid' | 'paid' | 'refunded'
          stripe_session_id: string | null
          refunded_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled'
          enrolled_at?: string
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          stripe_session_id?: string | null
          refunded_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled'
          enrolled_at?: string
          payment_status?: 'unpaid' | 'paid' | 'refunded'
          stripe_session_id?: string | null
          refunded_at?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          course_id: string
          teacher_id: string | null
          week_start: string
          status: 'active' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          teacher_id?: string | null
          week_start: string
          status?: 'active' | 'completed'
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          teacher_id?: string | null
          week_start?: string
          status?: 'active' | 'completed'
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
        }
        Update: {
          id?: string
          group_id?: string
          user_id?: string
        }
      }
      sessions: {
        Row: {
          id: string
          group_id: string
          scheduled_at: string
          duration_minutes: number
          status: 'scheduled' | 'active' | 'completed' | 'cancelled'
          room_token: string
          recording_url: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          scheduled_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          room_token?: string
          recording_url?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          scheduled_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'active' | 'completed' | 'cancelled'
          room_token?: string
          recording_url?: string | null
          notes?: string | null
        }
      }
      signaling: {
        Row: {
          id: string
          room_token: string
          from_user: string
          to_user: string | null
          type: string
          payload: Json
          created_at: string
        }
        Insert: {
          id?: string
          room_token: string
          from_user: string
          to_user?: string | null
          type: string
          payload: Json
          created_at?: string
        }
        Update: never
      }
    }
  }
}

// ── Stage 3 types (not in Database generic — tables added via migration) ──────
export type TeacherProfile = {
  user_id: string
  intro_video_url: string | null
  years_experience: number
  certifications: string[]
  languages_taught: string[]
  rating: number
  review_count: number
  created_at: string
}

export type CourseModule = {
  id: string
  course_id: string
  week_number: number
  title: string
  topics: string[]
}

export type CourseTeacher = {
  id: string
  course_id: string
  teacher_id: string
}

export type Review = {
  id: string
  course_id: string
  teacher_id: string | null
  student_id: string
  rating: number
  body: string | null
  created_at: string
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Course = Database['public']['Tables']['courses']['Row']
export type Enrollment = Database['public']['Tables']['enrollments']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SignalingMessage = Database['public']['Tables']['signaling']['Row']

export type EnrollmentWithCourse = Enrollment & { courses: Course | null }
export type SessionWithGroup = Session & {
  groups: Group & {
    courses: Pick<Course, 'name' | 'language'> | null
    profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
  } | null
}
export type GroupWithDetails = Group & {
  courses: Pick<Course, 'name' | 'language' | 'level' | 'sessions_per_week' | 'duration_weeks'> | null
  group_members: Array<GroupMember & { profiles: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null }>
}
