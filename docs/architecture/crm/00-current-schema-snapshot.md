# Mahjong Tarot — Supabase schema snapshot

Pulled from prod (`ntqmddmesgdquatodsyu`) on 2026-05-22 to inform CRM design.

## Tables at a glance

| Table | Rows | Purpose | CRM relevance |
|---|---:|---|---|
| `profiles` | 8 | Site members (1:1 with `auth.users`), role gate (`member`/`astrologer`/`admin`), Stripe ids | **Core identity** — every logged-in user. Already has `role`, `is_premium`, Stripe ids. |
| `clients` | 2 | Astrologer portal's CRM-style record (name, contact, birth data, subscription_status) | **Already a mini-CRM** for portal/admin. `subscription_status ∈ {none,active,lapsed,cancelled}`. Can link to a `profiles.user_id`. |
| `people` | 28 | Anyone who has contacted the site (email, name, phone, birthday, `chinese_sign`, `ok_to_contact`) | Inbound contact directory — pre-account leads. |
| `leads` | 1 | Email nurture pipeline (stage 0..N, status, next_send_at) | Drip campaign state. |
| `inquiries` | 38 | Contact form / booking inquiries (FK → `people`, FK → `reading_types`) | First-touch interactions. |
| `sessions` | 2 | Reading sessions (client × astrologer × scheduled_at + meeting source) | Astrologer portal core entity. |
| `reports` | 2 | Post-session report drafts/sent emails | Output of a session. |
| `inner_circle` | 7 | A profile's loved-ones (relationships, birth data, pillars) | Personal data per member, not CRM. |
| `readings` | 1 | User-generated compatibility readings | Tool output. |
| `reading_types` | 1 | Catalogue of reading offerings | Reference data. |
| `meeting_source_connections` | 0 | OAuth to meeting sources (Zoom/Meet/etc) | Per-astrologer integration tokens. |
| `horoscopes` / `horoscope_runs` | 39 / 0 | Daily horoscope content + job log | Not CRM. |
| `almanac_days` | 2184 | Almanac data | Not CRM. |

## Foreign keys (public schema)

```
inquiries.person_id        → people.id
inquiries.reading_type_id  → reading_types.id
reports.client_id          → clients.id
reports.session_id         → sessions.id
sessions.client_id         → clients.id
```

> **Gap:** `clients.user_id`, `clients.created_by`, `sessions.astrologer_id`, `reports.generated_by`, `inner_circle.user_id`, `readings.user_id`, `leads.email`, `meeting_source_connections.user_id` — none of these have FKs declared. They likely point to `auth.users.id` / `profiles.user_id` but aren't enforced.

## Identity model (current)

```
auth.users  (Supabase)
   │ 1:1
   ▼
profiles.user_id  ──role──>  'member' | 'astrologer' | 'admin'
                  ──premium──> is_premium, stripe_customer_id

people (anonymous contact)  ──email match──>  could become a profile
leads  (email nurture)       ──email match──>  could become a profile
clients (portal record)      ──user_id────>   profile (if signed up)
```

There's no single "contact" entity. A real person can show up in `people`, `leads`, `profiles`, and `clients` independently with no enforced link.

## Per-table column detail

## almanac_days

- `date` date NOT NULL
- `weekday` text NOT NULL
- `pillars` jsonb NOT NULL
- `lunar_day` integer NOT NULL
- `lunar_month` integer NOT NULL
- `is_leap_month` boolean NOT NULL = false
- `officer` jsonb NOT NULL
- `year_conflict` text NOT NULL
- `auspicious_hours` jsonb NOT NULL
- `activities` jsonb NOT NULL
- `match_day` jsonb null
- `western_moment` text null
- `holiday` text null
- `score` integer NOT NULL
- `tone` text NOT NULL
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()

## clients

- `id` uuid NOT NULL = gen_random_uuid()
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()
- `user_id` uuid null
- `full_name` text NOT NULL
- `email` text null
- `phone` text null
- `birthday` date null
- `birth_time` time without time zone null
- `birth_place` text null
- `gender` text null
- `notes` text null
- `subscription_status` text NOT NULL = 'none'::text
- `subscription_started_at` timestamp with time zone null
- `subscription_ended_at` timestamp with time zone null
- `created_by` uuid null

## horoscope_runs

- `id` uuid NOT NULL = gen_random_uuid()
- `run_at` timestamp with time zone NOT NULL = now()
- `target_date` date NOT NULL
- `status` text NOT NULL
- `generated` integer NOT NULL = 0
- `failed` integer NOT NULL = 0
- `error_message` text null
- `duration_ms` integer null

## horoscopes

- `date` date NOT NULL
- `scope` text NOT NULL
- `category` text NOT NULL
- `text` text NOT NULL
- `score` integer NOT NULL
- `tone` text NOT NULL
- `signal_payload` jsonb NOT NULL
- `status` text NOT NULL = 'published'::text
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()

## inner_circle

- `id` uuid NOT NULL = gen_random_uuid()
- `user_id` uuid NOT NULL
- `name` text NOT NULL
- `relationship` text NOT NULL
- `birthday` date null
- `birth_time` time without time zone null
- `birth_place` text null
- `gender` text null
- `pillars` jsonb null
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()

## inquiries

- `id` uuid NOT NULL = gen_random_uuid()
- `person_id` uuid NOT NULL
- `type` text NOT NULL
- `reading_type_id` uuid null
- `subject` text null
- `message` text null
- `source` text null
- `status` text NOT NULL = 'received'::text
- `created_at` timestamp with time zone NOT NULL = now()

## leads

- `id` uuid NOT NULL = gen_random_uuid()
- `email` text NOT NULL
- `name` text null
- `source` text NOT NULL
- `stage` integer NOT NULL = 0
- `status` text NOT NULL = 'active'::text
- `last_emailed_at` timestamp with time zone null
- `next_send_at` timestamp with time zone null = now()
- `metadata` jsonb null = '{}'::jsonb
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()

## meeting_source_connections

- `user_id` uuid NOT NULL
- `source` text NOT NULL
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()
- `access_token` text NOT NULL
- `refresh_token` text null
- `token_expires_at` timestamp with time zone null
- `account_label` text null
- `account_metadata` jsonb null = '{}'::jsonb

## people

- `id` uuid NOT NULL = gen_random_uuid()
- `email` text NOT NULL
- `name` text null
- `phone` text null
- `address` text null
- `chinese_sign` text null
- `birthday` date null
- `ok_to_contact` boolean NOT NULL = true
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()

## profiles

- `user_id` uuid NOT NULL
- `name` text null
- `birthday` date null
- `birth_time` time without time zone null
- `birth_place` text null
- `gender` text null
- `pillars` jsonb null
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()
- `is_premium` boolean NOT NULL = false
- `membership_type` text null
- `premium_expires_at` timestamp with time zone null
- `stripe_customer_id` text null
- `stripe_subscription_id` text null
- `role` text NOT NULL = 'member'::text

## reading_types

- `id` uuid NOT NULL = gen_random_uuid()
- `slug` text NOT NULL
- `name` text NOT NULL
- `duration` text null
- `description` text null
- `in_person` boolean NOT NULL = false
- `online` boolean NOT NULL = true
- `via_ai` boolean NOT NULL = false
- `sort_order` integer NOT NULL = 0
- `is_active` boolean NOT NULL = true
- `created_at` timestamp with time zone NOT NULL = now()

## readings

- `id` uuid NOT NULL = gen_random_uuid()
- `user_id` uuid NOT NULL
- `slug` text NOT NULL
- `type` text NOT NULL = 'compatibility'::text
- `person1_name` text null
- `person1_birthday` date null
- `person1_birth_time` time without time zone null
- `person1_gender` text null
- `person2_name` text null
- `person2_birthday` date null
- `person2_birth_time` time without time zone null
- `person2_gender` text null
- `rating` numeric null
- `report` jsonb null
- `created_at` timestamp with time zone NOT NULL = now()

## reports

- `id` uuid NOT NULL = gen_random_uuid()
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()
- `client_id` uuid NOT NULL
- `session_id` uuid null
- `generated_by` uuid null
- `meeting_source` text null
- `meeting_external_id` text null
- `source_transcript` text null
- `source_summary` text null
- `status` text NOT NULL = 'draft'::text
- `title` text null
- `body_markdown` text null
- `sent_at` timestamp with time zone null
- `sent_to_email` text null
- `email_message_id` text null
- `generation_error` text null

## sessions

- `id` uuid NOT NULL = gen_random_uuid()
- `created_at` timestamp with time zone NOT NULL = now()
- `updated_at` timestamp with time zone NOT NULL = now()
- `client_id` uuid NOT NULL
- `astrologer_id` uuid NOT NULL
- `scheduled_at` timestamp with time zone NOT NULL
- `duration_minutes` integer null = 60
- `status` text NOT NULL = 'scheduled'::text
- `meeting_source` text null
- `meeting_external_id` text null
- `prep_notes` text null
- `post_call_notes` text null
- `transcript_text` text null
- `summary_text` text null
