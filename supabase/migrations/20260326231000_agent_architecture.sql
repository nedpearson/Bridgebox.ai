-- Phase 8: Autonomous Agent Architecture
-- Creates the core AI worker catalog, tenant-level orchestration mapping, action queuing, and immutable audit logging.

-- Enums
CREATE TYPE bb_autonomy_level AS ENUM ('level_0', 'level_1', 'level_2', 'level_3');
CREATE TYPE bb_agent_category AS ENUM ('operational', 'customer', 'financial', 'document', 'super_admin', 'industry_specific');
CREATE TYPE bb_action_status AS ENUM ('pending', 'approved', 'rejected', 'executed', 'failed', 'rolled_back');
CREATE TYPE bb_action_risk AS ENUM ('low', 'medium', 'high', 'critical');

-- 1. Master Agent Catalog (Global/SuperAdmin)
CREATE TABLE IF NOT EXISTS public.bb_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category bb_agent_category NOT NULL,
    industry_target TEXT, -- e.g. 'law_firm', 'accounting', 'bridal', 'global'
    capabilities_json JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ['send_email', 'update_crm']
    recommended_autonomy bb_autonomy_level NOT NULL DEFAULT 'level_1',
    is_premium BOOLEAN NOT NULL DEFAULT false,
    price_amount NUMERIC,
    is_published BOOLEAN NOT NULL DEFAULT false,
    version TEXT NOT NULL DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tenant Installed Agents
CREATE TABLE IF NOT EXISTS public.bb_tenant_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.bb_agents(id) ON DELETE CASCADE,
    autonomy_level bb_autonomy_level NOT NULL DEFAULT 'level_1',
    status TEXT NOT NULL DEFAULT 'active', -- active, paused, error
    custom_instructions TEXT, 
    memory_retention_days INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, agent_id)
);

-- 3. Agent Inbox / Action Queue
CREATE TABLE IF NOT EXISTS public.bb_agent_actions_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    tenant_agent_id UUID NOT NULL REFERENCES public.bb_tenant_agents(id) ON DELETE CASCADE,
    proposed_action TEXT NOT NULL, -- The specific RPC routing or function name e.g. 'send_invoice_reminder'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb, -- Execution arguments
    explanation TEXT NOT NULL, -- Why the agent wants to do this
    confidence_score NUMERIC NOT NULL, -- 0.0 to 1.0
    risk_level bb_action_risk NOT NULL DEFAULT 'low',
    status bb_action_status NOT NULL DEFAULT 'pending',
    expiration_date TIMESTAMPTZ, -- When the pending action becomes obsolete
    context_references JSONB NOT NULL DEFAULT '[]'::jsonb, -- Files, leads, or history evaluating this action
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Audit Log (Immutable History)
CREATE TABLE IF NOT EXISTS public.bb_agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    tenant_agent_id UUID NOT NULL REFERENCES public.bb_tenant_agents(id) ON DELETE CASCADE,
    action_queue_id UUID REFERENCES public.bb_agent_actions_queue(id) ON DELETE CASCADE, -- Link back if applicable
    event_type TEXT NOT NULL, -- 'executed', 'evaluated', 'failed', 'blocked_by_policy'
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    execution_time_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Contextual Memory (Safe Vector/JSON array storage area isolated per tenant)
CREATE TABLE IF NOT EXISTS public.bb_agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    tenant_agent_id UUID NOT NULL REFERENCES public.bb_tenant_agents(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'lead', 'client', 'project'
    entity_id UUID NOT NULL,
    memory_fragments JSONB NOT NULL DEFAULT '[]'::jsonb, -- Rolling history array or summaries
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(organization_id, tenant_agent_id, entity_type, entity_id)
);

-- Indexing for Fast Queue Tracking
CREATE INDEX IF NOT EXISTS idx_bb_agent_queue_status ON public.bb_agent_actions_queue(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_bb_agent_audit_org ON public.bb_agent_audit_logs(organization_id, created_at);

-- Set RLS Security Boundaries
ALTER TABLE public.bb_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_tenant_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_agent_actions_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_agent_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_agent_memory ENABLE ROW LEVEL SECURITY;

-- 1. Master Agent Catalog (Everyone can see published agents)
CREATE POLICY "Users can view published master agents"
    ON public.bb_agents FOR SELECT
    USING (is_published = true OR auth.role() = 'service_role');

-- 2. Tenant Installed Agents (Isolated)
CREATE POLICY "Users can view and manage their installed agents"
    ON public.bb_tenant_agents FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ));

-- 3. Action Queue (Inbox) - Isolated
CREATE POLICY "Users can manage action queue strictly within their tenant"
    ON public.bb_agent_actions_queue FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ));

-- 4. Audit Log - Read Only for Users (Immutable via API mostly)
CREATE POLICY "Users can read own audit logs"
    ON public.bb_agent_audit_logs FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Agents can insert audit logs"
    ON public.bb_agent_audit_logs FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ));

-- 5. Memory Vectors - Isolated
CREATE POLICY "Users can view and manage agent memory"
    ON public.bb_agent_memory FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ))
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.bb_user_organizations WHERE user_id = auth.uid()
    ));
