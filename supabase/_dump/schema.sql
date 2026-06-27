


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."add_member_to_group_conversation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_conv_id uuid;
begin
  select id into v_conv_id
  from public.conversations
  where group_id = NEW.group_id and type = 'group';

  if v_conv_id is not null then
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv_id, NEW.user_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."add_member_to_group_conversation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_teacher_to_group_conversation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_conv_id uuid;
begin
  if NEW.teacher_id is null then
    return NEW;
  end if;

  if OLD.teacher_id is distinct from NEW.teacher_id then
    select id into v_conv_id
    from public.conversations
    where group_id = NEW.id and type = 'group';

    if v_conv_id is not null then
      insert into public.conversation_participants (conversation_id, user_id)
      values (v_conv_id, NEW.teacher_id)
      on conflict do nothing;
    end if;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."add_teacher_to_group_conversation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_group_conversation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  v_conv_id uuid;
begin
  insert into public.conversations (type, group_id)
  values ('group', NEW.id)
  on conflict do nothing
  returning id into v_conv_id;

  -- If conversation was just created and group has a teacher, add them as participant
  if v_conv_id is not null and NEW.teacher_id is not null then
    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conv_id, NEW.teacher_id)
    on conflict do nothing;
  end if;

  return NEW;
end;
$$;


ALTER FUNCTION "public"."create_group_conversation"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_message_count"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select count(*)::bigint
  from public.messages m
  join public.conversation_participants cp
    on cp.conversation_id = m.conversation_id
   and cp.user_id = auth.uid()
  where m.sender_id != auth.uid()
    and m.deleted_at is null
    and m.created_at > coalesce(cp.last_read_at, '1970-01-01'::timestamptz)
$$;


ALTER FUNCTION "public"."get_unread_message_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."my_conversation_ids"() RETURNS SETOF "uuid"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select conversation_id
  from public.conversation_participants
  where user_id = auth.uid()
$$;


ALTER FUNCTION "public"."my_conversation_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."users_share_group"("user_a" "uuid", "user_b" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select exists (
    select 1 from public.group_members a
    join public.group_members b on a.group_id = b.group_id
    where a.user_id = user_a and b.user_id = user_b

    union all

    select 1 from public.groups g
    join public.group_members m on m.group_id = g.id
    where (g.teacher_id = user_a and m.user_id = user_b)
       or (g.teacher_id = user_b and m.user_id = user_a)
  );
$$;


ALTER FUNCTION "public"."users_share_group"("user_a" "uuid", "user_b" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."conversation_participants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone DEFAULT "now"(),
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."conversation_participants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "group_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "conversations_type_check" CHECK (("type" = ANY (ARRAY['direct'::"text", 'group'::"text"])))
);


ALTER TABLE "public"."conversations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "week_number" integer NOT NULL,
    "title" "text" NOT NULL,
    "topics" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."course_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_teachers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'approved'::"text" NOT NULL,
    CONSTRAINT "course_teachers_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."course_teachers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "language" "text" NOT NULL,
    "level" "text" NOT NULL,
    "duration_weeks" integer NOT NULL,
    "sessions_per_week" integer DEFAULT 3 NOT NULL,
    "max_group_size" integer DEFAULT 2 NOT NULL,
    "price_pkr" numeric(10,2) DEFAULT 0 NOT NULL,
    "thumbnail_url" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "outcomes" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "courses_level_check" CHECK (("level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"])))
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enrollments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "course_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "enrolled_at" timestamp with time zone DEFAULT "now"(),
    "payment_status" "text" DEFAULT 'unpaid'::"text" NOT NULL,
    "stripe_session_id" "text",
    "refunded_at" timestamp with time zone,
    CONSTRAINT "enrollments_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['unpaid'::"text", 'paid'::"text", 'refunded'::"text"]))),
    CONSTRAINT "enrollments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'assigned'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."enrollments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_action_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "notes" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "group_action_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'resolved'::"text", 'rejected'::"text"]))),
    CONSTRAINT "group_action_requests_type_check" CHECK (("type" = ANY (ARRAY['pause'::"text", 'student_reassignment'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."group_action_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "teacher_id" "uuid",
    "week_start" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "acceptance_status" "text" DEFAULT 'accepted'::"text" NOT NULL,
    "proposed_at" timestamp with time zone,
    "responded_at" timestamp with time zone,
    "declined_teachers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    CONSTRAINT "groups_acceptance_status_check" CHECK (("acceptance_status" = ANY (ARRAY['pending_teacher'::"text", 'accepted'::"text", 'declined'::"text"]))),
    CONSTRAINT "groups_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid",
    "type" "text" DEFAULT 'text'::"text" NOT NULL,
    "content" "text",
    "file_url" "text",
    "file_name" "text",
    "file_size" bigint,
    "mime_type" "text",
    "duration_seconds" integer,
    "reply_to_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "messages_type_check" CHECK (("type" = ANY (ARRAY['text'::"text", 'voice_note'::"text", 'file'::"text", 'image'::"text"]))),
    CONSTRAINT "msg_has_body" CHECK ((("content" IS NOT NULL) OR ("file_url" IS NOT NULL)))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "payload" "jsonb" DEFAULT '{}'::"jsonb",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "read_at" timestamp with time zone
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "bio" "text",
    "avatar_url" "text",
    "languages" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "native_lang" "text",
    "target_langs" "text"[] DEFAULT '{}'::"text"[],
    "levels" "jsonb" DEFAULT '{}'::"jsonb",
    "timezone" "text",
    "availability" "jsonb" DEFAULT '[]'::"jsonb",
    "goals" "text"[] DEFAULT '{}'::"text"[],
    "onboarding_completed" boolean DEFAULT false,
    "notification_prefs" "jsonb" DEFAULT '{}'::"jsonb",
    "intro_video_url" "text",
    "years_experience" integer DEFAULT 0,
    "certifications" "text"[] DEFAULT '{}'::"text"[],
    "languages_taught" "jsonb" DEFAULT '[]'::"jsonb",
    "rating" numeric DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "rate_per_session" numeric DEFAULT 25,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'teacher'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "course_id" "uuid" NOT NULL,
    "teacher_id" "uuid",
    "student_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "body" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."session_attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "student_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'present'::"text" NOT NULL,
    CONSTRAINT "session_attendance_status_check" CHECK (("status" = ANY (ARRAY['present'::"text", 'late'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."session_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "duration_minutes" integer DEFAULT 60 NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "room_token" "text" DEFAULT ("gen_random_uuid"())::"text",
    "recording_url" "text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "topic" "text",
    "prep_notes" "text",
    "session_notes" "text",
    "homework_text" "text",
    "homework_url" "text",
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    CONSTRAINT "sessions_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'active'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."signaling" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_token" "text" NOT NULL,
    "from_user" "uuid" NOT NULL,
    "to_user" "uuid",
    "type" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."signaling" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "languages_taught" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "certifications" "text"[] DEFAULT '{}'::"text"[],
    "intro_video_url" "text",
    "teaching_bio" "text",
    "availability" "text"[] DEFAULT '{}'::"text"[],
    "timezone" "text",
    "rate_expectation" numeric(10,2),
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "admin_notes" "text",
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_at" timestamp with time zone,
    CONSTRAINT "teacher_applications_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."teacher_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_payouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "amount" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "payout_date" "date",
    "method" "text",
    "stripe_transfer_id" "text",
    "admin_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "teacher_payouts_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'paid'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."teacher_payouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teacher_unavailability" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "teacher_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "reason" "text"
);


ALTER TABLE "public"."teacher_unavailability" OWNER TO "postgres";


ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_user_id_key" UNIQUE ("conversation_id", "user_id");



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_id_week_number_key" UNIQUE ("course_id", "week_number");



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_teachers"
    ADD CONSTRAINT "course_teachers_course_id_teacher_id_key" UNIQUE ("course_id", "teacher_id");



ALTER TABLE ONLY "public"."course_teachers"
    ADD CONSTRAINT "course_teachers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_user_id_course_id_key" UNIQUE ("user_id", "course_id");



ALTER TABLE ONLY "public"."group_action_requests"
    ADD CONSTRAINT "group_action_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_user_id_key" UNIQUE ("group_id", "user_id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_course_id_student_id_key" UNIQUE ("course_id", "student_id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_attendance"
    ADD CONSTRAINT "session_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_attendance"
    ADD CONSTRAINT "session_attendance_session_id_student_id_key" UNIQUE ("session_id", "student_id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_room_token_key" UNIQUE ("room_token");



ALTER TABLE ONLY "public"."signaling"
    ADD CONSTRAINT "signaling_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_applications"
    ADD CONSTRAINT "teacher_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_applications"
    ADD CONSTRAINT "teacher_applications_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."teacher_payouts"
    ADD CONSTRAINT "teacher_payouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_unavailability"
    ADD CONSTRAINT "teacher_unavailability_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teacher_unavailability"
    ADD CONSTRAINT "teacher_unavailability_teacher_id_date_key" UNIQUE ("teacher_id", "date");



CREATE UNIQUE INDEX "enrollments_stripe_session_id_idx" ON "public"."enrollments" USING "btree" ("stripe_session_id") WHERE ("stripe_session_id" IS NOT NULL);



CREATE INDEX "idx_attendance_session" ON "public"."session_attendance" USING "btree" ("session_id");



CREATE UNIQUE INDEX "idx_conversations_group" ON "public"."conversations" USING "btree" ("group_id") WHERE ("group_id" IS NOT NULL);



CREATE INDEX "idx_cp_conversation" ON "public"."conversation_participants" USING "btree" ("conversation_id");



CREATE INDEX "idx_cp_user" ON "public"."conversation_participants" USING "btree" ("user_id");



CREATE INDEX "idx_groups_acceptance_pending" ON "public"."groups" USING "btree" ("teacher_id") WHERE ("acceptance_status" = 'pending_teacher'::"text");



CREATE INDEX "idx_msg_conversation" ON "public"."messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "idx_msg_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_notif_user" ON "public"."notifications" USING "btree" ("user_id", "sent_at" DESC);



CREATE INDEX "idx_payouts_teacher" ON "public"."teacher_payouts" USING "btree" ("teacher_id", "created_at" DESC);



CREATE INDEX "idx_reviews_teacher" ON "public"."reviews" USING "btree" ("teacher_id");



CREATE INDEX "signaling_room_token_created_at_idx" ON "public"."signaling" USING "btree" ("room_token", "created_at");



CREATE OR REPLACE TRIGGER "trg_add_member_to_group_conv" AFTER INSERT ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."add_member_to_group_conversation"();



CREATE OR REPLACE TRIGGER "trg_add_teacher_to_group_conv" AFTER UPDATE OF "teacher_id" ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."add_teacher_to_group_conversation"();



CREATE OR REPLACE TRIGGER "trg_group_conversation" AFTER INSERT ON "public"."groups" FOR EACH ROW EXECUTE FUNCTION "public"."create_group_conversation"();



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversation_participants"
    ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conversations"
    ADD CONSTRAINT "conversations_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_modules"
    ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_teachers"
    ADD CONSTRAINT "course_teachers_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_teachers"
    ADD CONSTRAINT "course_teachers_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enrollments"
    ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_action_requests"
    ADD CONSTRAINT "group_action_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_action_requests"
    ADD CONSTRAINT "group_action_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_reply_to_id_fkey" FOREIGN KEY ("reply_to_id") REFERENCES "public"."messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."session_attendance"
    ADD CONSTRAINT "session_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_attendance"
    ADD CONSTRAINT "session_attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signaling"
    ADD CONSTRAINT "signaling_from_user_fkey" FOREIGN KEY ("from_user") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."signaling"
    ADD CONSTRAINT "signaling_to_user_fkey" FOREIGN KEY ("to_user") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_applications"
    ADD CONSTRAINT "teacher_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_payouts"
    ADD CONSTRAINT "teacher_payouts_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teacher_unavailability"
    ADD CONSTRAINT "teacher_unavailability_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "admin_all_courses" ON "public"."courses" USING ("public"."is_admin"());



CREATE POLICY "admin_all_enrollments" ON "public"."enrollments" USING ("public"."is_admin"());



CREATE POLICY "admin_all_group_members" ON "public"."group_members" USING ("public"."is_admin"());



CREATE POLICY "admin_all_groups" ON "public"."groups" USING ("public"."is_admin"());



CREATE POLICY "admin_all_profiles" ON "public"."profiles" USING ("public"."is_admin"());



CREATE POLICY "admin_all_sessions" ON "public"."sessions" USING ("public"."is_admin"());



CREATE POLICY "attendance_student_select" ON "public"."session_attendance" FOR SELECT USING (("auth"."uid"() = "student_id"));



CREATE POLICY "attendance_teacher_all" ON "public"."session_attendance" USING ((EXISTS ( SELECT 1
   FROM ("public"."sessions" "s"
     JOIN "public"."groups" "g" ON (("g"."id" = "s"."group_id")))
  WHERE (("s"."id" = "session_attendance"."session_id") AND ("g"."teacher_id" = "auth"."uid"())))));



CREATE POLICY "conv_participant_select" ON "public"."conversations" FOR SELECT USING (("id" IN ( SELECT "public"."my_conversation_ids"() AS "my_conversation_ids")));



ALTER TABLE "public"."conversation_participants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_modules" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "course_modules_select" ON "public"."course_modules" FOR SELECT USING (true);



ALTER TABLE "public"."course_teachers" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "course_teachers_insert" ON "public"."course_teachers" FOR INSERT WITH CHECK (("auth"."uid"() = "teacher_id"));



CREATE POLICY "course_teachers_select" ON "public"."course_teachers" FOR SELECT USING (true);



CREATE POLICY "course_teachers_update" ON "public"."course_teachers" FOR UPDATE USING ((("auth"."uid"() = "teacher_id") OR true));



ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "courses_select" ON "public"."courses" FOR SELECT USING (("is_active" = true));



CREATE POLICY "cp_owner_update" ON "public"."conversation_participants" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "cp_participant_select" ON "public"."conversation_participants" FOR SELECT USING (("conversation_id" IN ( SELECT "public"."my_conversation_ids"() AS "my_conversation_ids")));



CREATE POLICY "cp_participant_update" ON "public"."conversation_participants" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "cp_service_insert" ON "public"."conversation_participants" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."enrollments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "enrollments_insert" ON "public"."enrollments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "enrollments_select" ON "public"."enrollments" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("auth"."uid"() IN ( SELECT "groups"."teacher_id"
   FROM "public"."groups"
  WHERE ("groups"."course_id" = "enrollments"."course_id")))));



ALTER TABLE "public"."group_action_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "group_action_teacher_all" ON "public"."group_action_requests" USING (("auth"."uid"() = "teacher_id"));



ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "group_members_insert" ON "public"."group_members" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "group_members_select" ON "public"."group_members" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "groups_insert" ON "public"."groups" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "groups_select" ON "public"."groups" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "msg_owner_update" ON "public"."messages" FOR UPDATE USING (("auth"."uid"() = "sender_id"));



CREATE POLICY "msg_participant_insert" ON "public"."messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND ("conversation_id" IN ( SELECT "public"."my_conversation_ids"() AS "my_conversation_ids"))));



CREATE POLICY "msg_participant_select" ON "public"."messages" FOR SELECT USING (("conversation_id" IN ( SELECT "public"."my_conversation_ids"() AS "my_conversation_ids")));



CREATE POLICY "msg_sender_update" ON "public"."messages" FOR UPDATE USING ((("sender_id" = "auth"."uid"()) AND ("conversation_id" IN ( SELECT "public"."my_conversation_ids"() AS "my_conversation_ids"))));



CREATE POLICY "notif_owner_select" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "notif_owner_update" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "notif_service_insert" ON "public"."notifications" FOR INSERT WITH CHECK (true);



ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payouts_teacher_select" ON "public"."teacher_payouts" FOR SELECT USING (("auth"."uid"() = "teacher_id"));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_insert" ON "public"."reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "student_id"));



CREATE POLICY "reviews_select" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "reviews_update" ON "public"."reviews" FOR UPDATE USING (("auth"."uid"() = "student_id"));



ALTER TABLE "public"."session_attendance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sessions_insert" ON "public"."sessions" FOR INSERT WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "sessions_select" ON "public"."sessions" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



ALTER TABLE "public"."signaling" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "signaling_insert" ON "public"."signaling" FOR INSERT WITH CHECK (("auth"."uid"() = "from_user"));



CREATE POLICY "signaling_select" ON "public"."signaling" FOR SELECT USING ((("auth"."uid"() = "from_user") OR ("auth"."uid"() = "to_user")));



ALTER TABLE "public"."teacher_applications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teacher_apps_insert" ON "public"."teacher_applications" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "teacher_apps_select" ON "public"."teacher_applications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "teacher_apps_update_own" ON "public"."teacher_applications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."teacher_payouts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teacher_unavailability" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "unavail_owner_all" ON "public"."teacher_unavailability" USING (("auth"."uid"() = "teacher_id"));



CREATE POLICY "users insert own notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "users see own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."conversation_participants";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."messages";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."signaling";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."add_member_to_group_conversation"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_member_to_group_conversation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_member_to_group_conversation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."add_teacher_to_group_conversation"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_teacher_to_group_conversation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_teacher_to_group_conversation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_group_conversation"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_group_conversation"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_group_conversation"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_message_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_message_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."my_conversation_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."my_conversation_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."my_conversation_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."users_share_group"("user_a" "uuid", "user_b" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."users_share_group"("user_a" "uuid", "user_b" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."users_share_group"("user_a" "uuid", "user_b" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."conversation_participants" TO "anon";
GRANT ALL ON TABLE "public"."conversation_participants" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_participants" TO "service_role";



GRANT ALL ON TABLE "public"."conversations" TO "anon";
GRANT ALL ON TABLE "public"."conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."conversations" TO "service_role";



GRANT ALL ON TABLE "public"."course_modules" TO "anon";
GRANT ALL ON TABLE "public"."course_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."course_modules" TO "service_role";



GRANT ALL ON TABLE "public"."course_teachers" TO "anon";
GRANT ALL ON TABLE "public"."course_teachers" TO "authenticated";
GRANT ALL ON TABLE "public"."course_teachers" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."enrollments" TO "anon";
GRANT ALL ON TABLE "public"."enrollments" TO "authenticated";
GRANT ALL ON TABLE "public"."enrollments" TO "service_role";



GRANT ALL ON TABLE "public"."group_action_requests" TO "anon";
GRANT ALL ON TABLE "public"."group_action_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."group_action_requests" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."session_attendance" TO "anon";
GRANT ALL ON TABLE "public"."session_attendance" TO "authenticated";
GRANT ALL ON TABLE "public"."session_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";



GRANT ALL ON TABLE "public"."signaling" TO "anon";
GRANT ALL ON TABLE "public"."signaling" TO "authenticated";
GRANT ALL ON TABLE "public"."signaling" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_applications" TO "anon";
GRANT ALL ON TABLE "public"."teacher_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_applications" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_payouts" TO "anon";
GRANT ALL ON TABLE "public"."teacher_payouts" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_payouts" TO "service_role";



GRANT ALL ON TABLE "public"."teacher_unavailability" TO "anon";
GRANT ALL ON TABLE "public"."teacher_unavailability" TO "authenticated";
GRANT ALL ON TABLE "public"."teacher_unavailability" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































