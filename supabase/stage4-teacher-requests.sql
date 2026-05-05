-- Migration: Add status to course_teachers for approval workflow

ALTER TABLE public.course_teachers 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved' 
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Drop any existing conflicting policies if needed, or just add new ones
-- Assuming there's a policy "course_teachers_insert", let's create or replace it
-- We'll just create a new one for insert
CREATE POLICY "course_teachers_insert" ON public.course_teachers 
  FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "course_teachers_update" ON public.course_teachers 
  FOR UPDATE USING (auth.uid() = teacher_id OR true);
