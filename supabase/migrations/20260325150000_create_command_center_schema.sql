-- SUPER ADMIN COMMAND CENTER SCHEMA
-- Isolated backend foundation for internal tools

-- 1. Enhance Internal Recordings
ALTER TABLE public.internal_recordings
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS related_internal_entity_type text,
ADD COLUMN IF NOT EXISTS related_internal_entity_id text,
ADD COLUMN IF NOT EXISTS thumbnail_path text,
ADD COLUMN IF NOT EXISTS transcript_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS summary_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes text;

-- 2. System Logs Viewer (internal_logs)
CREATE TABLE IF NOT EXISTS public.internal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  type text NOT NULL,
  module text,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  correlation_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_logs ENABLE ROW LEVEL SECURITY;

-- 3. Background Job / Queue Monitor (internal_jobs)
CREATE TABLE IF NOT EXISTS public.internal_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'retrying', 'cancelled')),
  payload jsonb DEFAULT '{}'::jsonb,
  failure_reason text,
  retry_count integer DEFAULT 0,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_jobs ENABLE ROW LEVEL SECURITY;

-- 4. AI Pipeline Monitor (internal_ai_runs)
CREATE TABLE IF NOT EXISTS public.internal_ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  provider text NOT NULL,
  input_source_type text,
  output_status text NOT NULL CHECK (output_status IN ('pending', 'processing', 'completed', 'failed')),
  duration_ms integer,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_ai_runs ENABLE ROW LEVEL SECURITY;

-- 5. Integration Health Monitor (internal_integration_events)
CREATE TABLE IF NOT EXISTS public.internal_integration_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'degraded', 'failing', 'disconnected', 'unknown')),
  last_sync_at timestamptz,
  failure_summary text,
  environment_source text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_integration_events ENABLE ROW LEVEL SECURITY;

-- 6. Internal Notes / Build Journal (internal_notes)
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  tags text[] DEFAULT '{}',
  linked_entity_type text,
  linked_entity_id text,
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_internal_notes_updated_at
BEFORE UPDATE ON public.internal_notes
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- 7. Internal Audit Trail (internal_audit_events)
CREATE TABLE IF NOT EXISTS public.internal_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  module text NOT NULL,
  target_type text,
  target_id text,
  metadata_summary jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.internal_audit_events ENABLE ROW LEVEL SECURITY;

-- Universal RLS Policies for super_admin ONLY (applied to all tables)
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['internal_logs', 'internal_jobs', 'internal_ai_runs', 'internal_integration_events', 'internal_notes', 'internal_audit_events'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('
      CREATE POLICY "Super admin access %I" ON public.%I FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''super_admin''))
      WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = ''super_admin''))
    ', t, t);
  END LOOP;
END $$;
