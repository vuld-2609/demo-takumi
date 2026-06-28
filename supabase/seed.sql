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

-- ---------------------------------------------------------------------------
-- Live-board demo data (added in 0002) — extra Sunners across departments with
-- all four hero-badge tiers, so the /kudos board filters + badge tooltips have
-- realistic content on a fresh install. Requires migration 0002 (4-tier check).
-- ---------------------------------------------------------------------------
insert into public.profiles (id, auth_user_id, display_name, avatar_url, department, rank, hero_badge)
values
  ('44444444-4444-4444-4444-444444444444', null, 'Trần Thị Bích',  '/profile/kudos-avatar-2.png', 'CEVC1', 'CEVC1', 'super_hero'),
  ('55555555-5555-5555-5555-555555555555', null, 'Lê Hoàng Nam',   '/profile/kudos-avatar-1.png', 'CEVC2', 'CEVC2', 'new_hero'),
  ('66666666-6666-6666-6666-666666666666', null, 'Phạm Minh Khôi', '/profile/kudos-avatar-2.png', 'CEVC4', 'CEVC4', 'rising_hero'),
  ('77777777-7777-7777-7777-777777777777', null, 'Đỗ Thu Hà',      '/profile/kudos-avatar-1.png', 'OPD',   'OPD',   'legend_hero'),
  ('88888888-8888-8888-8888-888888888888', null, 'Vũ Anh Tuấn',    '/profile/kudos-avatar-2.png', 'Infra', 'Infra', 'new_hero')
on conflict (id) do nothing;

-- Board kudos spread across departments + hashtags, with descending heart counts
-- so the Highlight carousel (top-5 by hearts) is meaningful.
insert into public.kudos (id, sender_id, receiver_id, message, images, hashtags, category, is_spam, created_at)
values
  ('bbbbbbb1-0000-0000-0000-000000000001',
   '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666',
   'Cảm ơn Khôi đã luôn sẵn sàng hỗ trợ team, tinh thần trách nhiệm rất cao!',
   '{}', array['#Dedicated','#Teamwork'], null, false, '2025-10-29 09:15:00+07'),
  ('bbbbbbb1-0000-0000-0000-000000000002',
   '55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777',
   'Chị Hà truyền cảm hứng cho cả phòng bằng năng lượng tích cực mỗi ngày.',
   '{}', array['#Inspiring','#Leadership'], null, false, '2025-10-28 14:30:00+07'),
  ('cccccccc-0000-0000-0000-000000000001',
   '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444',
   'Bích giải quyết sự cố rất nhanh và đáng tin cậy. Cảm ơn em nhiều!',
   '{}', array['#Reliability','#Creative'], null, false, '2025-10-27 16:45:00+07')
on conflict (id) do nothing;

-- Hearts for the board kudos (distinct counts → clear Highlight ordering).
insert into public.kudos_hearts (kudos_id, user_id)
values
  ('bbbbbbb1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbb1-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222'),
  ('bbbbbbb1-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333'),
  ('bbbbbbb1-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbb1-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222'),
  ('cccccccc-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111')
on conflict (kudos_id, user_id) do nothing;
