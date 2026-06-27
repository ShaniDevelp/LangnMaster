-- Enable Realtime for notifications so the unread-message badge updates live.
-- Without this, postgres_changes INSERT events never fire and the messages-tab
-- unread count only refreshes on navigation.

alter publication supabase_realtime add table public.notifications;
