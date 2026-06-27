-- Migration 0001 — Profiles, Kudos, Kudos Hearts
-- SAA 2025 profile page backend.
-- Apply in Supabase Dashboard → SQL Editor (or `supabase db push`).
-- Safe to re-run: guarded with IF NOT EXISTS / CREATE OR REPLACE / DROP POLICY IF EXISTS.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: canonical user record. Linked to auth.users via nullable
-- auth_user_id so that SAMPLE/seed profiles can exist without an auth account.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete cascade,
  display_name  text not null default 'Sunner',
  avatar_url    text,
  department    text,
  rank          text not null default 'CEVC1',
  hero_badge    text check (hero_badge in ('legend_hero', 'super_hero')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- kudos: a recognition post from sender -> receiver.
-- ---------------------------------------------------------------------------
create table if not exists public.kudos (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  message     text not null default '',
  images      text[] not null default '{}',
  hashtags    text[] not null default '{}',
  category    text,                       -- e.g. 'idol_gioi_tre' or null
  is_spam     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists kudos_receiver_id_idx on public.kudos (receiver_id);
create index if not exists kudos_sender_id_idx   on public.kudos (sender_id);
create index if not exists kudos_created_at_idx  on public.kudos (created_at desc);

-- ---------------------------------------------------------------------------
-- kudos_hearts: a "tim" reaction. One per (kudos, profile).
-- ---------------------------------------------------------------------------
create table if not exists public.kudos_hearts (
  kudos_id   uuid not null references public.kudos(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (kudos_id, user_id)
);

create index if not exists kudos_hearts_kudos_id_idx on public.kudos_hearts (kudos_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up.
-- Pulls display_name / avatar from Google OAuth metadata.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1),
      'Sunner'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already existed before this trigger.
insert into public.profiles (auth_user_id, display_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1), 'Sunner'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
left join public.profiles p on p.auth_user_id = u.id
where p.id is null;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.kudos        enable row level security;
alter table public.kudos_hearts enable row level security;

-- profiles: any authenticated user can read; you may only update your own row.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Recovery path: a user may (re)create only their own profile row if missing.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (auth_user_id = auth.uid());

-- kudos: readable by any authenticated user.
drop policy if exists kudos_select on public.kudos;
create policy kudos_select on public.kudos
  for select to authenticated using (true);

-- kudos_hearts: readable by all authenticated; insert/delete only your own,
-- where user_id maps to YOUR profile.
drop policy if exists kudos_hearts_select on public.kudos_hearts;
create policy kudos_hearts_select on public.kudos_hearts
  for select to authenticated using (true);

drop policy if exists kudos_hearts_insert_own on public.kudos_hearts;
create policy kudos_hearts_insert_own on public.kudos_hearts
  for insert to authenticated
  with check (user_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists kudos_hearts_delete_own on public.kudos_hearts;
create policy kudos_hearts_delete_own on public.kudos_hearts
  for delete to authenticated
  using (user_id in (select id from public.profiles where auth_user_id = auth.uid()));
