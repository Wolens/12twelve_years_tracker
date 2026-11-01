-- Одно поколение отката app_state (выполните в Supabase SQL Editor)
alter table public.user_profiles
  add column if not exists app_state_backup jsonb;
