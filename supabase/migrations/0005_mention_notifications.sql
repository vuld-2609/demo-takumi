-- Migration 0005 — Mention notifications
-- Notifies users @mentioned in a kudos body. The compose editor now embeds the
-- mentioned profile id as `data-id="<uuid>"` on each `<span class="mention">`
-- (validated by the HTML sanitizer), so the kudos trigger can extract those ids
-- and create `mention_received` notifications.
-- Apply AFTER 0004. Idempotent / safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. Allow the new notification type.
-- ---------------------------------------------------------------------------
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications
  add constraint notifications_type_check
  check (type in ('kudo_received', 'heart_received', 'mention_received'));

-- ---------------------------------------------------------------------------
-- 2. Extend the kudos-insert trigger to also notify mentioned users.
--    - kudo_received → the receiver (unchanged).
--    - mention_received → every DISTINCT profile id found in the message body,
--      excluding the sender (no self-notify) and the receiver (they already get
--      kudo_received — avoids two notifications for one kudos).
--    Only ids that map to a real profile are used (the join drops the rest), so
--    a stray/forged id can never raise an FK error and abort the kudos insert.
-- ---------------------------------------------------------------------------
create or replace function public.notify_on_kudo()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Receiver notification (skip self-kudos, which the app blocks too).
  if NEW.sender_id is distinct from NEW.receiver_id then
    insert into public.notifications (recipient_id, actor_id, type, kudos_id)
    values (NEW.receiver_id, NEW.sender_id, 'kudo_received', NEW.id);
  end if;

  -- Mention notifications: pull every data-id="<uuid>" out of the message HTML.
  insert into public.notifications (recipient_id, actor_id, type, kudos_id)
  select distinct p.id, NEW.sender_id, 'mention_received', NEW.id
  from (
    select (regexp_matches(
      coalesce(NEW.message, ''),
      'data-id="([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})"',
      'g'
    ))[1] as mid
  ) m
  join public.profiles p on p.id = m.mid::uuid
  where p.id <> NEW.sender_id
    and p.id <> NEW.receiver_id;

  return NEW;
end;
$$;
