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
          intro_video_url: string | null
          years_experience: number | null
          certifications: string[] | null
          languages_taught: Json | null
          rating: number | null
          review_count: number | null
          rate_per_session: number | null
          preferences: Json | null
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
          intro_video_url?: string | null
          years_experience?: number | null
          certifications?: string[] | null
          languages_taught?: Json | null
          rating?: number | null
          review_count?: number | null
          rate_per_session?: number | null
          preferences?: Json | null
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
          intro_video_url?: string | null
          years_experience?: number | null
          certifications?: string[] | null
          languages_taught?: Json | null
          rating?: number | null
          review_count?: number | null
          rate_per_session?: number | null
          preferences?: Json | null
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

// ── Chat ──────────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'voice_note' | 'file' | 'image'
export type ConversationType = 'direct' | 'group'

export type Conversation = {
  id: string
  type: ConversationType
  group_id: string | null
  created_at: string
}

export type ConversationParticipant = {
  id: string
  conversation_id: string
  user_id: string
  last_read_at: string
  joined_at: string
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string | null
  type: MessageType
  content: string | null
  file_url: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  duration_seconds: number | null
  reply_to_id: string | null
  created_at: string
  deleted_at: string | null
}

// Composite types for UI
export type MessageWithSender = Message & {
  sender: Pick<Profile, 'id' | 'name' | 'avatar_url'> | null
  reply_to: Pick<Message, 'id' | 'content' | 'type' | 'sender_id'> | null
}

export type ConversationWithMeta = Conversation & {
  participants: Array<ConversationParticipant & {
    profiles: Pick<Profile, 'id' | 'name' | 'avatar_url' | 'role'>
  }>
  last_message: MessageWithSender | null
  unread_count: number
  group_name?: string | null
}

// ── Phase 1: Teacher vetting ──────────────────────────────────────────────────

export type TeacherApplication = {
  id: string
  user_id: string
  languages_taught: { lang: string; proficiency: string }[]
  certifications: string[]
  intro_video_url: string | null
  teaching_bio: string | null
  availability: string[]
  timezone: string | null
  rate_expectation: number | null
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
}
