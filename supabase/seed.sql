-- Seed — sample profiles, kudos and hearts for the SAA 2025 profile page.
-- Idempotent (fixed UUIDs + ON CONFLICT DO NOTHING). Run AFTER 0001_profiles_kudos.sql.
-- Content mirrors the MoMorph "Profile bản thân" design (sample data only).
--
-- These sample profiles have auth_user_id = NULL (no login). To see the seeded
-- kudos on YOUR OWN profile page, see supabase/README.md → "Link your account".

-- Sample profiles -----------------------------------------------------------
insert into public.profiles (id, auth_user_id, display_name, avatar_url, department, rank, hero_badge)
values
  ('11111111-1111-1111-1111-111111111111', null, 'Huỳnh Dương Xuân Nhật', '/profile/kudos-avatar-1.png', 'CEVC3',  'CEVC3',  'legend_hero'),
  ('22222222-2222-2222-2222-222222222222', null, 'Huỳnh Dương Xuân',      '/profile/kudos-avatar-2.png', 'CEVC10', 'CEVC10', 'legend_hero'),
  ('33333333-3333-3333-3333-333333333333', null, 'Nguyễn Văn A',          '/profile/kudos-avatar-1.png', 'CEVC10', 'CEVC10', 'super_hero')
on conflict (id) do nothing;

-- Sample kudos (subject = profile 1111…, "Huỳnh Dương Xuân Nhật") -------------
-- 2 received (incl. spam + idol category), 2 sent.
insert into public.kudos (id, sender_id, receiver_id, message, images, hashtags, category, is_spam, created_at)
values
  ('aaaaaaa1-0000-0000-0000-000000000001',
   '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111',
   'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...',
   array['/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png'],
   array['#Dedicated','#Inspring','#Dedicated','#Inspring','#Dedicated','#Inspring'],
   null, true, '2025-10-30 10:00:00+07'),
  ('aaaaaaa1-0000-0000-0000-000000000002',
   '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
   'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...',
   array['/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png'],
   array['#Dedicated','#Inspring','#Dedicated','#Inspring','#Dedicated','#Inspring'],
   'idol_gioi_tre', false, '2025-10-30 10:00:00+07'),
  ('aaaaaaa1-0000-0000-0000-000000000003',
   '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222',
   'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...',
   array['/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png'],
   array['#Dedicated','#Inspring','#Dedicated','#Inspring','#Dedicated','#Inspring'],
   'idol_gioi_tre', false, '2025-10-30 10:00:00+07'),
  ('aaaaaaa1-0000-0000-0000-000000000004',
   '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333',
   'Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...',
   array['/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png','/profile/kudos-sample-image.png'],
   array['#Dedicated','#Inspring','#Dedicated','#Inspring','#Dedicated','#Inspring'],
   null, true, '2025-10-30 10:00:00+07')
on conflict (id) do nothing;

-- Hearts: give the received posts (subject 1111…) ~ a handful of reactions.
insert into public.kudos_hearts (kudos_id, user_id)
values
  ('aaaaaaa1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaa1-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333'),
  ('aaaaaaa1-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  ('aaaaaaa1-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333')
on conflict (kudos_id, user_id) do nothing;
