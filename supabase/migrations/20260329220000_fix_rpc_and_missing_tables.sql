/*
  # Global Platform Error Fixes
  
  1. Fixes RPC functions that were broken when tables were prefixed with bb_
  2. Ensures explicit constraints on bb_project_delivery so PostgREST joins succeed
  3. Mocks missing tables required by new UI endpoints 
     (Marketplace, Agent Center, Executive Metrics) so they don't return 404s
*/

-- 1. Fix RPC Functions broken by table prefixing
CREATE OR REPLACE FUNCTION get_entity_link_counts(p_entity_type text, p_entity_id uuid)
RETURNS TABLE (linked_type text, link_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN source_id = p_entity_id THEN target_type
      ELSE source_type
    END as linked_type,
    COUNT(*) as link_count
  FROM bb_entity_links
  WHERE (source_type = p_entity_type AND source_id = p_entity_id)
     OR (target_type = p_entity_type AND target_id = p_entity_id)
  GROUP BY 
    CASE 
      WHEN source_id = p_entity_id THEN target_type
      ELSE source_type
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fix PostgREST constraints for bb_project_delivery
ALTER TABLE bb_project_delivery 
  DROP CONSTRAINT IF EXISTS project_delivery_project_id_fkey,
  DROP CONSTRAINT IF EXISTS project_delivery_team_lead_id_fkey;

-- We add the exact named constraints the frontend is querying via:
-- `project:bb_projects!project_delivery_project_id_fkey` 
-- `team_lead:bb_profiles!project_delivery_team_lead_id_fkey`
ALTER TABLE bb_project_delivery 
  ADD CONSTRAINT project_delivery_project_id_fkey FOREIGN KEY (project_id) REFERENCES bb_projects(id) ON DELETE CASCADE,
  ADD CONSTRAINT project_delivery_team_lead_id_fkey FOREIGN KEY (team_lead_id) REFERENCES bb_profiles(id) ON DELETE SET NULL;


-- 3. Create missing UI tables that cause 404s

CREATE TABLE IF NOT EXISTS bb_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE bb_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for authenticated users" ON bb_agents FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS bb_organization_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL UNIQUE REFERENCES bb_organizations(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bb_marketplace_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES bb_templates(id) ON DELETE CASCADE,
  category text NOT NULL,
  is_published boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  install_count integer DEFAULT 0,
  average_rating numeric DEFAULT 0.0,
  organization_id uuid REFERENCES bb_organizations(id) ON DELETE SET NULL,
  best_use_case text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bb_tenant_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES bb_agents(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(organization_id, agent_id)
);

CREATE TABLE IF NOT EXISTS bb_agent_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES bb_agents(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bb_client_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  status text DEFAULT 'open',
  title text,
  value numeric DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bb_client_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  status text DEFAULT 'active',
  description text,
  severity text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS bb_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE UNIQUE,
  status text DEFAULT 'not_started',
  completion_percentage integer DEFAULT 0,
  target_completion_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Turn on basic RLS for new tables
ALTER TABLE bb_organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_tenant_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_agent_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_client_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_client_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Provide dummy RLS policies to let authenticated users view them (so the UI doesn't 404 or 401)
CREATE POLICY "Enable read access for authenticated users" ON bb_organization_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable all access for authenticated users" ON bb_organization_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON bb_marketplace_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON bb_tenant_agents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON bb_agent_audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON bb_client_opportunities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON bb_client_risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read access for authenticated users" ON bb_onboarding_progress FOR SELECT TO authenticated USING (true);


