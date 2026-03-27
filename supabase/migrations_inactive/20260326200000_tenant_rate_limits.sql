-- Migration: Tenant Rate Limiting Matrices
-- Description: Engineers rigorous consumption limits mapped against subscription tiers.

CREATE TABLE IF NOT EXISTS public.bb_tenant_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    ai_requests_per_minute INTEGER DEFAULT 10,
    webhook_ingest_per_minute INTEGER DEFAULT 100,
    background_worker_concurrency INTEGER DEFAULT 2,
    max_templates_allowed INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id)
);

-- Optimization Index
CREATE INDEX IF NOT EXISTS idx_tenant_rate_limits_org ON public.bb_tenant_rate_limits(organization_id);

-- Enable RLS
ALTER TABLE public.bb_tenant_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own rate limits"
    ON public.bb_tenant_rate_limits FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM bb_organization_memberships
            WHERE user_id = auth.uid()
        )
    );

-- Rate limits are strictly enforced by Edge functions or Super Admins
CREATE POLICY "Super Admins can update rate limits"
    ON public.bb_tenant_rate_limits FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bb_organization_memberships m
            WHERE m.user_id = auth.uid()
            AND m.role = 'super_admin'
        )
    );
