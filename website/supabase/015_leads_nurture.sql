-- ============================================================
-- 015_leads_nurture.sql
-- Lead nurture table for mahjongtarot.com
-- Tracks every lead from site signup through the email sequence
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL UNIQUE,
  name             TEXT,

  -- Where the lead came from
  source           TEXT NOT NULL CHECK (source IN ('newsletter', 'contact', 'readings', 'mirror')),

  -- Nurture sequence state
  stage            INTEGER NOT NULL DEFAULT 0,         -- which email they are up to (0 = not yet sent)
  status           TEXT NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'completed', 'unsubscribed', 'converted')),

  -- Scheduling
  last_emailed_at  TIMESTAMPTZ,
  next_send_at     TIMESTAMPTZ DEFAULT now(),          -- eligible immediately on signup

  -- Arbitrary extra data (e.g. inquiry subject, reading type interest)
  metadata         JSONB DEFAULT '{}'::jsonb,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Indexes ──────────────────────────────────────────────────
-- Agent queries by status + next_send_at on every run
CREATE INDEX IF NOT EXISTS idx_leads_due
  ON public.leads (status, next_send_at)
  WHERE status = 'active';

-- Lookup by email (dedup checks on signup)
CREATE INDEX IF NOT EXISTS idx_leads_email
  ON public.leads (email);

-- ── Auto-update updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_leads_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_leads_updated_at();

-- ── Row-level security ────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Only authenticated service role can read/write leads
-- (the email-marketer agent uses the service role key)
CREATE POLICY "service_role_full_access" ON public.leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- No public read access
CREATE POLICY "no_public_access" ON public.leads
  FOR ALL
  TO anon
  USING (false);

-- ── Seed data (test lead) ─────────────────────────────────────
INSERT INTO public.leads (email, name, source, stage, status, next_send_at, metadata)
VALUES (
  'khang.h.nguyen@edge8.ai',
  'Khang',
  'newsletter',
  0,
  'active',
  now(),
  '{"note": "test lead"}'::jsonb
)
ON CONFLICT (email) DO NOTHING;
