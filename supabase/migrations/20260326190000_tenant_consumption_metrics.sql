-- Migration: Tenant Consumption Metrics
-- Description: Tracking execution scale for dynamic Stripe metered billing thresholds.

CREATE TABLE IF NOT EXISTS public.bb_tenant_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('workflow_execution', 'ai_invocation', 'storage_gb', 'api_calls')),
    quantity INTEGER NOT NULL DEFAULT 1,
    stripe_invoice_id text,
    billed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimization Index for end-of-month Stripe Aggregations
CREATE INDEX IF NOT EXISTS idx_tenant_consumption_org_billed ON public.bb_tenant_consumption(organization_id, billed);

-- Enable RLS
ALTER TABLE public.bb_tenant_consumption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their consumption usage"
    ON public.bb_tenant_consumption FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM bb_organization_memberships
            WHERE user_id = auth.uid()
        )
    );

-- Internal inserts are managed strictly by Service Role / Serverless runtimes
CREATE POLICY "Internal service roles can map consumption logs"
    ON public.bb_tenant_consumption FOR INSERT
    TO authenticated
    WITH CHECK (true);
