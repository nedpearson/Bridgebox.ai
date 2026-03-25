-- ==============================================================================
-- Migration: Internal AI-Assisted Dev Task Generation System
-- Description: Establishes the `internal_dev_tasks` entity to securely capture
--              and iteratively review LLM-translated support telemetries before
--              exporting them into structured Antigravity build prompts.
-- ==============================================================================

CREATE TABLE public.internal_dev_tasks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    title text NOT NULL,
    summary text NOT NULL,
    
    -- Analytical Breakdown
    problem_statement text,
    observed_behavior text,
    expected_behavior text,
    root_cause_hypothesis text,
    product_area text,
    category text,
    
    -- Source Traceability (Loosely coupled intentionally for multidimensional inputs)
    source_type text NOT NULL CHECK (source_type IN ('support_ticket', 'support_recording', 'support_screen_session', 'internal_recording', 'internal_note')),
    source_id uuid NOT NULL,
    linked_support_ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
    linked_internal_recording_id uuid REFERENCES public.internal_recordings(id) ON DELETE SET NULL,
    
    -- Operational Vectors
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status text DEFAULT 'draft_generated' CHECK (status IN ('draft_generated', 'under_review', 'approved', 'queued_for_build', 'sent_to_antigravity', 'in_progress', 'completed', 'archived', 'rejected')),
    
    -- Telemetry Confidence & Duplication Checks
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    similar_task_refs jsonb DEFAULT '[]', -- ARRAY of potentially duplicated UUIDs
    
    -- Proposed Implementation Output (Drafts)
    proposed_acceptance_criteria text,
    proposed_testing_notes text,
    proposed_implementation_notes text,
    
    -- Ownership Vectors
    created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Tracking Booleans
    approved_for_build boolean DEFAULT false,
    exported_for_antigravity boolean DEFAULT false,
    
    -- Stamps
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Establish strictly isolated RLS (Internal / Super Admin Only)
ALTER TABLE public.internal_dev_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admins can execute SELECT on internal_dev_tasks"
    ON public.internal_dev_tasks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super Admins can execute INSERT on internal_dev_tasks"
    ON public.internal_dev_tasks
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super Admins can execute UPDATE on internal_dev_tasks"
    ON public.internal_dev_tasks
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

CREATE POLICY "Super Admins can execute DELETE on internal_dev_tasks"
    ON public.internal_dev_tasks
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'super_admin'
        )
    );

-- Attach indexes for heavily queried vectors across the Super Admin Hub
CREATE INDEX idx_internal_dev_tasks_status ON public.internal_dev_tasks(status);
CREATE INDEX idx_internal_dev_tasks_source_type ON public.internal_dev_tasks(source_type);
CREATE INDEX idx_internal_dev_tasks_product_area ON public.internal_dev_tasks(product_area);
