-- ==============================================================================
-- Migration: AI-Assisted Bug Report and QA Test Generation System
-- Description: Establishes `internal_bug_reports` and `internal_qa_test_cases` 
--              aggregating generative outputs derived from telemetry across Support.
--              Enforces explicit Super Admin isolation preserving zero tenant leakage.
-- ==============================================================================

CREATE TABLE public.internal_bug_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Telemetry
    title text NOT NULL,
    summary text NOT NULL,
    issue_type text DEFAULT 'backend_fault' CHECK (issue_type IN ('backend_fault', 'ui_fault', 'logic_error', 'database_constraint', 'auth_boundary', 'performance_degradation')),
    product_area text,
    workflow_area text,
    
    -- Diagnostics
    observed_behavior text,
    expected_behavior text,
    root_cause_hypothesis text,
    reproduction_steps text,
    environment_notes text,
    
    -- Vectors
    severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    business_impact text,
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status text DEFAULT 'draft_generated' CHECK (status IN ('draft_generated', 'under_review', 'approved', 'confirmed', 'needs_more_evidence', 'duplicate', 'archived', 'rejected')),
    
    -- Source Tracing
    source_type text NOT NULL CHECK (source_type IN ('support_ticket', 'support_recording', 'support_screen_session', 'internal_recording', 'internal_note', 'internal_dev_task')),
    source_id uuid NOT NULL,
    linked_support_ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
    linked_internal_dev_task_id uuid REFERENCES public.internal_dev_tasks(id) ON DELETE SET NULL,
    similar_bug_refs jsonb DEFAULT '[]', -- ARRAY of similar Bug IDs for clustering
    
    -- Identity Management
    created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Tracking Booleans
    approved_for_build boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE public.internal_qa_test_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Telemetry
    title text NOT NULL,
    objective text NOT NULL,
    product_area text,
    workflow_area text,
    
    -- Scenario Matrix
    preconditions text,
    setup_notes text,
    test_steps text,
    expected_results text,
    
    -- Regression Vectors
    regression_risks text,
    edge_cases text,
    negative_tests text,
    post_fix_validation text,
    
    -- Metadata
    confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
    status text DEFAULT 'draft_generated' CHECK (status IN ('draft_generated', 'under_review', 'approved', 'archived', 'rejected')),
    
    -- Source Tracing
    source_type text NOT NULL CHECK (source_type IN ('support_ticket', 'support_recording', 'support_screen_session', 'internal_recording', 'internal_note', 'internal_dev_task', 'internal_bug_report')),
    source_id uuid NOT NULL,
    linked_support_ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE SET NULL,
    linked_internal_dev_task_id uuid REFERENCES public.internal_dev_tasks(id) ON DELETE SET NULL,
    linked_internal_bug_report_id uuid REFERENCES public.internal_bug_reports(id) ON DELETE SET NULL,
    similar_qa_refs jsonb DEFAULT '[]',
    
    -- Identity Management
    created_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    
    approved_for_build boolean DEFAULT false,
    
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- ==============================================================================
-- Secure Isolation Over Subsystems
-- ==============================================================================

ALTER TABLE public.internal_bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_qa_test_cases ENABLE ROW LEVEL SECURITY;

-- Bug Reports RLS
CREATE POLICY "Super Admins can execute SELECT on internal_bug_reports" ON public.internal_bug_reports FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute INSERT on internal_bug_reports" ON public.internal_bug_reports FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute UPDATE on internal_bug_reports" ON public.internal_bug_reports FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute DELETE on internal_bug_reports" ON public.internal_bug_reports FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- QA Test Cases RLS
CREATE POLICY "Super Admins can execute SELECT on internal_qa_test_cases" ON public.internal_qa_test_cases FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute INSERT on internal_qa_test_cases" ON public.internal_qa_test_cases FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute UPDATE on internal_qa_test_cases" ON public.internal_qa_test_cases FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));
CREATE POLICY "Super Admins can execute DELETE on internal_qa_test_cases" ON public.internal_qa_test_cases FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'super_admin'));

-- Query Scape indexing
CREATE INDEX idx_internal_bug_reports_status ON public.internal_bug_reports(status);
CREATE INDEX idx_internal_bug_reports_source_type ON public.internal_bug_reports(source_type);
CREATE INDEX idx_internal_bug_reports_product_area ON public.internal_bug_reports(product_area);

CREATE INDEX idx_internal_qa_test_cases_status ON public.internal_qa_test_cases(status);
CREATE INDEX idx_internal_qa_test_cases_source_type ON public.internal_qa_test_cases(source_type);
CREATE INDEX idx_internal_qa_test_cases_product_area ON public.internal_qa_test_cases(product_area);
