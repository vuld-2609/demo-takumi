-- Migration 0004 — Notifications (realtime)
-- Backs the in-app notification bell + "Tất cả thông báo" page.
-- Realtime delivery is via Supabase Realtime (postgres_changes over WebSocket):
-- the table is added to the `supabase_realtime` publication and each user
-- subscribes to their own rows (RLS-scoped).
-- Apply AFTER 0001–0003. Idempotent / safe to re-run.

-- ---------------------------------------------------------------------------
-- notifications: one row per event delivered to a recipient.
--   recipient_id — who SEES the notification (their profile id)
--   actor_id     — who TRIGGERED it (sender / hearter); null if deleted
--   type         — 'kudo_received' | 'heart_received'
--   kudos_id     — the related kudos (for navigation); null if deleted
--   read_at      — null = unread; set when the recipient reads it
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id     uuid references public.profiles(id) on delete set null,
  type         text not null check (type in ('kudo_received', 'heart_received')),
  kudos_id     uuid references public.kudos(id) on delete cascade,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists notifications_recipient_idx
  on public.notifications (recipient_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (recipient_id) where read_at is null;

-- Realtime needs the full row on UPDATE so the recipient filter still matches
-- when a row is marked read.
alter table public.notifications replica identity full;

-- ---------------------------------------------------------------------------
-- Triggers — create notifications automatically from real events.
-- SECURITY DEFINER so the insert bypasses the recipient-only RLS (the actor
-- is not the recipient). search_path pinned to public for safety.
-- ---------------------------------------------------------------------------

-- A new kudos → notify the receiver (skip self-kudos, which the app blocks too).
create or replace function public.notify_on_kudo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.sender_id is distinct from NEW.receiver_id then
    insert into public.notifications (recipient_id, actor_id, type, kudos_id)
    values (NEW.receiver_id, NEW.sender_id, 'kudo_received', NEW.id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_kudo_created on public.kudos;
create trigger on_kudo_created
  after insert on public.kudos
  for each row execute function public.notify_on_kudo();

-- A new heart → notify the kudos' sender (skip hearting impossible self-kudos).
create or replace function public.notify_on_heart()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient uuid;
begin
  select sender_id into recipient from public.kudos where id = NEW.kudos_id;
  if recipient is not null and recipient is distinct from NEW.user_id then
    insert into public.notifications (recipient_id, actor_id, type, kudos_id)
    values (recipient, NEW.user_id, 'heart_received', NEW.kudos_id);
  end if;
  return NEW;
end;
$$;

drop trigger if exists on_heart_created on public.kudos_hearts;
create trigger on_heart_created
  after insert on public.kudos_hearts
  for each row execute function public.notify_on_heart();

-- ---------------------------------------------------------------------------
-- Row Level Security — a user only ever sees / updates their OWN notifications.
-- No client INSERT policy: rows are created exclusively by the definer triggers.
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (recipient_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (recipient_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (recipient_id in (select id from public.profiles where auth_user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Realtime — publish the table so subscribers get INSERT/UPDATE events.
-- Guarded so re-running does not error on "already a member".
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end
$$;
