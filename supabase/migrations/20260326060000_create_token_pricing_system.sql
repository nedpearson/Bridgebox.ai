-- ============================================
-- BRIDGEBOX: TOKEN-AWARE PRICING SYSTEM
-- Phase 1: Dynamic Pricing Models
-- Phase 5: Token Usage Ledger
-- Phase 8: Infrastructure Cost Events
-- ============================================

-- 1. PRICING MODELS TABLE
-- Stores the AI-generated dynamic pricing configuration per organization.
CREATE TABLE IF NOT EXISTS public.pricing_models (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    session_id uuid REFERENCES public.onboarding_sessions(id) ON DELETE SET NULL,

    -- Pricing Tier
    tier text DEFAULT 'growth' CHECK (tier IN ('low', 'medium', 'growth', 'high', 'enterprise')),
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'active', 'archived')),

    -- Base Platform Fee
    base_platform_fee numeric(10,2) DEFAULT 2500.00 NOT NULL,

    -- AI Usage (Token-Based Pricing)
    estimated_tokens_per_month bigint DEFAULT 500000,
    cost_per_1k_tokens numeric(8,6) DEFAULT 0.002000,  -- base AI cost
    ai_margin_multiplier numeric(5,3) DEFAULT 1.400,   -- 40% margin applied on top of AI cost
    estimated_ai_monthly_cost numeric(10,2) DEFAULT 0,

    -- Workflow / Automation Cost
    workflow_count int DEFAULT 0,
    workflow_execution_frequency text DEFAULT 'medium' CHECK (workflow_execution_frequency IN ('low', 'medium', 'high', 'enterprise')),
    workflow_complexity_weight numeric(5,3) DEFAULT 1.0,
    estimated_workflow_monthly_cost numeric(10,2) DEFAULT 0,

    -- Integration Cost
    integration_count int DEFAULT 0,
    integration_sync_frequency text DEFAULT 'daily' CHECK (integration_sync_frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
    integration_complexity text DEFAULT 'simple' CHECK (integration_complexity IN ('simple', 'moderate', 'deep')),
    estimated_integration_monthly_cost numeric(10,2) DEFAULT 0,

    -- Storage / Document Cost
    estimated_storage_gb numeric(10,2) DEFAULT 5.0,
    document_processing_volume int DEFAULT 100,
    estimated_storage_monthly_cost numeric(10,2) DEFAULT 0,

    -- Feature Cost
    custom_feature_count int DEFAULT 0,
    platform_feature_allocation jsonb DEFAULT '[]'::jsonb,
    estimated_feature_monthly_cost numeric(10,2) DEFAULT 0,

    -- Support & Agent Cost
    support_agent_usage text DEFAULT 'standard' CHECK (support_agent_usage IN ('basic', 'standard', 'advanced', 'enterprise')),
    estimated_support_monthly_cost numeric(10,2) DEFAULT 0,

    -- Total
    estimated_total_monthly_cost numeric(10,2) DEFAULT 0,
    approved_total_monthly_cost numeric(10,2),

    -- Admin Overrides
    admin_override_applied boolean DEFAULT false,
    admin_notes text,
    approved_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at timestamp with time zone,

    -- AI Estimation Inputs (Raw snapshot for auditing)
    ai_inputs_snapshot jsonb DEFAULT '{}'::jsonb,

    -- Audit
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.pricing_models ENABLE ROW LEVEL SECURITY;

-- Super admin can do anything
CREATE POLICY "Super admin full access to pricing_models" ON public.pricing_models
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Org members can view their own pricing model
CREATE POLICY "Users can view pricing models for their org" ON public.pricing_models
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = pricing_models.organization_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- 2. TOKEN USAGE LOGS TABLE
-- Every AI call is logged here for real-time tracking.
-- ============================================
CREATE TABLE IF NOT EXISTS public.token_usage_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

    -- What generated this token usage
    feature_context text NOT NULL,  -- e.g. 'onboarding', 'ai_copilot', 'workflow_agent', 'document_processing', etc.
    agent_name text,                -- e.g. 'BuildOrchestratorAgent', 'OptimizationAgent'
    workflow_id uuid,
    integration_id uuid,
    document_id uuid,

    -- Token Counts
    prompt_tokens int DEFAULT 0 NOT NULL,
    completion_tokens int DEFAULT 0 NOT NULL,
    total_tokens int GENERATED ALWAYS AS (prompt_tokens + completion_tokens) STORED,

    -- AI Provider Info
    ai_model text DEFAULT 'gpt-4o',
    ai_provider text DEFAULT 'openai',

    -- Computed cost
    cost_usd numeric(10,8) DEFAULT 0,

    -- Metadata
    request_metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.token_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view all token logs" ON public.token_usage_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Users can view token logs for their org" ON public.token_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = token_usage_logs.organization_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Service can insert token logs" ON public.token_usage_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = token_usage_logs.organization_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- 3. PLATFORM COST EVENTS TABLE
-- Tracks infrastructure and operational cost events.
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_cost_events (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

    event_type text NOT NULL CHECK (event_type IN (
        'storage_write', 'storage_read', 'api_call', 'workflow_execution',
        'integration_sync', 'document_processing', 'ai_agent_run'
    )),

    quantity numeric(12,4) DEFAULT 1,
    unit text DEFAULT 'count',  -- e.g. 'count', 'mb', 'seconds', 'tokens'
    unit_cost_usd numeric(10,8) DEFAULT 0,
    total_cost_usd numeric(10,8) DEFAULT 0,

    reference_id uuid,       -- workflow_id, document_id, etc.
    reference_type text,     -- 'workflow', 'document', 'integration'
    metadata jsonb DEFAULT '{}'::jsonb,

    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.platform_cost_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view all cost events" ON public.platform_cost_events
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "Users can view cost events for their org" ON public.platform_cost_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = platform_cost_events.organization_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Service can insert cost events" ON public.platform_cost_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = platform_cost_events.organization_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- 4. PRICING TEMPLATES TABLE
-- Super admin can create reusable pricing templates.
-- ============================================
CREATE TABLE IF NOT EXISTS public.pricing_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    tier text DEFAULT 'growth' CHECK (tier IN ('low', 'medium', 'growth', 'high', 'enterprise')),

    -- Template defaults (mirrors pricing_models structure)
    base_platform_fee numeric(10,2) DEFAULT 2500.00,
    ai_margin_multiplier numeric(5,3) DEFAULT 1.400,
    cost_per_1k_tokens numeric(8,6) DEFAULT 0.002000,
    workflow_complexity_weight numeric(5,3) DEFAULT 1.0,
    integration_cost_schedule jsonb DEFAULT '{}'::jsonb,
    storage_cost_per_gb numeric(8,4) DEFAULT 0.50,
    support_cost_schedule jsonb DEFAULT '{}'::jsonb,
    feature_cost_schedule jsonb DEFAULT '{}'::jsonb,

    is_active boolean DEFAULT true,
    created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.pricing_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access to pricing_templates" ON public.pricing_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================
-- 5. PERFORMANCE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pricing_models_org_id ON public.pricing_models(organization_id);
CREATE INDEX IF NOT EXISTS idx_pricing_models_status ON public.pricing_models(status);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_org_id ON public.token_usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_id ON public.token_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_feature ON public.token_usage_logs(feature_context);
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_created_at ON public.token_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_cost_events_org_id ON public.platform_cost_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_platform_cost_events_type ON public.platform_cost_events(event_type);

-- ============================================
-- 6. TIMESTAMPS
-- ============================================
CREATE TRIGGER set_timestamp_pricing_models
BEFORE UPDATE ON public.pricing_models
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_pricing_templates
BEFORE UPDATE ON public.pricing_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
