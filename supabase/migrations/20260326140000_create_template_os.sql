-- =========================================================================
-- BRIDGEBOX TEMPLATE OPERATING SYSTEM
-- Core Schema for Industry Packs, Business Overlays, and Generative AI 
-- =========================================================================

-- 1. Master Template Definitions
CREATE TABLE IF NOT EXISTS public.bb_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    category text, -- 'industry_pack', 'business_overlay', 'ai_generated'
    industry text,
    business_model text,
    target_personas jsonb DEFAULT '[]'::jsonb,
    configuration_payload jsonb DEFAULT '{}'::jsonb, -- Defines entities, views, workflows, agents
    billing_rules jsonb DEFAULT '{}'::jsonb, -- Defines minimum plan requirements
    branding_tokens jsonb DEFAULT '{}'::jsonb, -- Theming injections
    version text DEFAULT '1.0.0',
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'deprecated')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Tenant Installations Tracker
CREATE TABLE IF NOT EXISTS public.bb_template_installs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    template_id uuid NOT NULL REFERENCES public.bb_templates(id),
    installed_version text NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'uninstalled')),
    installed_by uuid REFERENCES auth.users(id),
    uninstalled_at timestamp with time zone,
    analytics_tracking jsonb DEFAULT '{}'::jsonb,
    generated_assets jsonb DEFAULT '{"projects": [], "workflows": [], "tasks": [], "integrations": [], "forms": []}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.bb_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_template_installs ENABLE ROW LEVEL SECURITY;

-- 1. Templates: Anyone can view Published templates natively. Admins can view Drafts.
CREATE POLICY "Public users can view published templates" ON public.bb_templates
    FOR SELECT USING (status = 'published');

CREATE POLICY "Super Admins can manage all templates" ON public.bb_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bb_profiles
            WHERE id = auth.uid() AND role IN ('super_admin')
        )
    );

-- 2. Template Installs: Strictly tenant-isolated
CREATE POLICY "Users can view template installs in their organization" ON public.bb_template_installs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bb_organization_memberships
            WHERE organization_id = bb_template_installs.tenant_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage template installs in their organization" ON public.bb_template_installs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.bb_organization_memberships
            WHERE organization_id = bb_template_installs.tenant_id 
            AND role IN ('super_admin', 'client_admin')
            AND user_id = auth.uid()
        )
    );

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE TRIGGER set_timestamp_bb_templates
BEFORE UPDATE ON public.bb_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_timestamp_bb_template_installs
BEFORE UPDATE ON public.bb_template_installs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
