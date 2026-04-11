-- ============================================================
-- Mahjong Tarot: Seed Test Data (10 inquiries)
-- Migration: 003_seed_test_data
-- Run this in Supabase SQL Editor AFTER 002_admin_dashboard.sql
-- ============================================================

-- Insert test people
insert into public.people (id, email, name, phone, chinese_sign, birthday) values
  ('a0000000-0000-0000-0000-000000000001', 'sarah.chen@example.com',    'Sarah Chen',       '(415) 555-0101', 'Dragon',  '1988-03-12'),
  ('a0000000-0000-0000-0000-000000000002', 'marcus.johnson@example.com','Marcus Johnson',    '(212) 555-0202', 'Tiger',   '1974-09-28'),
  ('a0000000-0000-0000-0000-000000000003', 'elena.ruiz@example.com',    'Elena Ruiz',        null,              'Rabbit',  null),
  ('a0000000-0000-0000-0000-000000000004', 'james.patel@example.com',   'James Patel',       '(310) 555-0404', 'Snake',   '1989-07-15'),
  ('a0000000-0000-0000-0000-000000000005', 'mei.wong@example.com',      'Mei Wong',          '(628) 555-0505', 'Horse',   '1990-02-04'),
  ('a0000000-0000-0000-0000-000000000006', 'alex.thompson@example.com', 'Alex Thompson',     null,              null,      null),
  ('a0000000-0000-0000-0000-000000000007', 'priya.sharma@example.com',  'Priya Sharma',      '(408) 555-0707', 'Rooster', '1993-11-22'),
  ('a0000000-0000-0000-0000-000000000008', 'david.kim@example.com',     'David Kim',         '(646) 555-0808', 'Ox',      '1985-01-30'),
  ('a0000000-0000-0000-0000-000000000009', 'lisa.martinez@example.com', 'Lisa Martinez',     null,              'Monkey',  null),
  ('a0000000-0000-0000-0000-000000000010', 'tom.nguyen@example.com',    'Tom Nguyen',        '(503) 555-1010', 'Pig',     '1995-06-18');

-- Get the reading type id for bookings
do $$
declare
  v_rt_id uuid;
begin
  select id into v_rt_id from public.reading_types where slug = 'mahjong-mirror-session' limit 1;

  -- Newsletter signups (3)
  insert into public.inquiries (person_id, type, source, status, created_at) values
    ('a0000000-0000-0000-0000-000000000003', 'newsletter', 'footer',       'received',  now() - interval '2 days'),
    ('a0000000-0000-0000-0000-000000000006', 'newsletter', 'blog',         'received',  now() - interval '5 days'),
    ('a0000000-0000-0000-0000-000000000009', 'newsletter', 'footer',       'read',      now() - interval '8 days');

  -- Contact inquiries (4)
  insert into public.inquiries (person_id, type, subject, message, source, status, created_at) values
    ('a0000000-0000-0000-0000-000000000001', 'contact', 'Speaking engagement inquiry',
     'Hi Bill, I organize the annual Asian Cultural Festival in San Francisco and would love to have you speak about Mahjong divination. The event is in September. Would you be available?',
     'contact-page', 'received', now() - interval '1 day'),

    ('a0000000-0000-0000-0000-000000000002', 'contact', 'Question about The Mahjong Mirror',
     'I just finished reading your book and I have a few questions about the chapter on the Four Winds. Is there a way to do a follow-up consultation about my specific reading?',
     'contact-page', 'read', now() - interval '3 days'),

    ('a0000000-0000-0000-0000-000000000004', 'contact', 'Media interview request',
     'I am a journalist with the San Jose Mercury News writing a feature on alternative divination practices in the Bay Area. Would you be open to an interview?',
     'contact-page', 'confirmed', now() - interval '6 days'),

    ('a0000000-0000-0000-0000-000000000010', 'contact', 'Gift reading for my mother',
     'My mother is turning 70 and she has always been fascinated by Mahjong. I would love to gift her a reading session. Do you offer gift certificates?',
     'contact-page', 'received', now() - interval '12 hours');

  -- Booking requests (3)
  insert into public.inquiries (person_id, type, reading_type_id, message, source, status, created_at) values
    ('a0000000-0000-0000-0000-000000000005', 'booking', v_rt_id,
     'I am going through a major career transition and would love guidance from the tiles. I am available weekday evenings after 6pm Pacific.',
     'readings', 'received', now() - interval '4 hours'),

    ('a0000000-0000-0000-0000-000000000007', 'booking', v_rt_id,
     'My wedding is coming up in August and I would like a reading about our compatibility and what the year ahead holds for us as a couple.',
     'readings', 'read', now() - interval '4 days'),

    ('a0000000-0000-0000-0000-000000000008', 'booking', v_rt_id,
     'I have been feeling stuck and a friend recommended your Mahjong Mirror sessions. I am open to any available time slot.',
     'readings', 'received', now() - interval '7 days');
end;
$$;
