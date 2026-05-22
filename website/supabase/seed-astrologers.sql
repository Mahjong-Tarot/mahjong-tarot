-- ============================================================
-- seed-astrologers.sql — Astrologer Portal: promote operators
-- ============================================================
-- NOT a migration. This is a runbook to be executed manually
-- against each environment (dev, prod) AFTER:
--   1. 016_roles.sql has been applied
--   2. Each user below has signed up at least once (so their
--      auth.users row and public.profiles row exist)
--
-- Re-runnable — uses simple updates keyed on email.
-- ============================================================

update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'dhajdu@gmail.com');

update public.profiles set role = 'astrologer'
where user_id = (select id from auth.users where email = 'firepig01@gmail.com');

update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'yon@edge8.co');

update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'dave@edge8.co');

-- Verify:
-- select p.role, u.email from public.profiles p
--   join auth.users u on u.id = p.user_id
--   where p.role in ('astrologer', 'admin')
--   order by p.role, u.email;
