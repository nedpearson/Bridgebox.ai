-- Migration: Enterprise Workflow Execution Engine
-- Description: Creates the execution tracking schema to monitor runtime logic sequences

CREATE TABLE IF NOT EXISTS public.bb_workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES public.bb_workflows(id) ON DELETE CASCADE,
    triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trigger_payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'succeeded', 'failed', 'retrying', 'canceled')),
    current_step_index INTEGER DEFAULT 0,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    execution_data JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Optimization Index
CREATE INDEX IF NOT EXISTS idx_workflow_exec_logs_org_status ON public.bb_workflow_execution_logs(organization_id, status);

-- Enable RLS
ALTER TABLE public.bb_workflow_execution_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Execution Logs
CREATE POLICY "Clients can view their own workflow execution logs"
    ON public.bb_workflow_execution_logs FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM bb_organization_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create their own workflow execution logs"
    ON public.bb_workflow_execution_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM bb_organization_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Internal service roles can update execution logs"
    ON public.bb_workflow_execution_logs FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
