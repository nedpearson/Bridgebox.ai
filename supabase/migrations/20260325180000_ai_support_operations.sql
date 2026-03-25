-- ==============================================================================
-- Migration: AI-Assisted Support Operations Module
-- Description: Extends support_tickets with structured AI triage fields, escalation 
--              flags, and internal linkage. Bootstraps explicit screen session tracking 
--              and the Resolution Pattern knowledge base.
-- ==============================================================================

-- 1. Extend support_tickets with AI and Escalation Metadata
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS ai_category text,
ADD COLUMN IF NOT EXISTS ai_severity text,
ADD COLUMN IF NOT EXISTS ai_urgency text,
ADD COLUMN IF NOT EXISTS ai_confidence numeric,
ADD COLUMN IF NOT EXISTS ai_product_area text,
ADD COLUMN IF NOT EXISTS ai_recommended_action text,
ADD COLUMN IF NOT EXISTS ai_possible_duplicate_refs jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_processed_at timestamptz,
ADD COLUMN IF NOT EXISTS ai_error text,

ADD COLUMN IF NOT EXISTS escalation_type text,
ADD COLUMN IF NOT EXISTS feature_gap_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurring_issue_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_gap_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS build_candidate_flag boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS proposed_solution text,
ADD COLUMN IF NOT EXISTS internal_priority text,
ADD COLUMN IF NOT EXISTS linked_internal_recording_id uuid, -- Reference generic if internal tracking used
ADD COLUMN IF NOT EXISTS linked_internal_note_id uuid;

-- Extend Status ENUM logically for Admin usages
ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_status_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check CHECK (
    status IN ('open', 'in_review', 'waiting_on_client', 'in_progress', 'resolved', 'closed', 'new', 'triage_pending', 'ai_processed', 'escalated_to_build', 'monitoring')
);

-- 2. Create support_screen_sessions Tracker
CREATE TABLE IF NOT EXISTS public.support_screen_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_code text NOT NULL,
    status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'active', 'ended', 'failed', 'expired')),
    started_at timestamptz DEFAULT now(),
    joined_by_super_admin_at timestamptz,
    ended_at timestamptz,
    ended_reason text,
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create support_resolution_patterns (Knowledge Base)
CREATE TABLE IF NOT EXISTS public.support_resolution_patterns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    known_issue_key text UNIQUE,
    internal_resolution_note text,
    suggested_response_template text,
    linked_product_area text,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexing for performance and analytics
CREATE INDEX IF NOT EXISTS idx_support_tickets_ai_status ON public.support_tickets(ai_status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_feature_gap ON public.support_tickets(feature_gap_flag) WHERE feature_gap_flag = true;
CREATE INDEX IF NOT EXISTS idx_support_sessions_ticket ON public.support_screen_sessions(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_sessions_org ON public.support_screen_sessions(organization_id);

-- 4. RLS ENFORCEMENT for new tables

-- Support Screen Sessions RLS
ALTER TABLE public.support_screen_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage all screen sessions"
  ON public.support_screen_sessions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

CREATE POLICY "Clients can view their own screen sessions"
  ON public.support_screen_sessions FOR SELECT TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create their own screen sessions"
  ON public.support_screen_sessions FOR INSERT TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_memberships
      WHERE user_id = auth.uid()
    ) AND user_id = auth.uid()
  );

-- Support Resolution Patterns (Knowledge Base) strictly internal
ALTER TABLE public.support_resolution_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can manage resolution patterns"
  ON public.support_resolution_patterns FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
