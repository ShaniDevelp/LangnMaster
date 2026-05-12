-- Fix notifications RLS so postgres_changes Realtime subscriptions work.
-- Plain user_id = auth.uid() avoids SECURITY DEFINER function overhead
-- that causes silent failures in Supabase Realtime.

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users see own notifications" ON public.notifications;
CREATE POLICY "users see own notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users insert own notifications" ON public.notifications;
CREATE POLICY "users insert own notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
