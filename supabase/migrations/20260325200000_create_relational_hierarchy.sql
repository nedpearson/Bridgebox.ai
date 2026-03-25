/*
  # Phase 1: Canonical Relational Operating Hierarchy
  
  1. New Tables:
    - `entity_links`: The master Polymorphic junction table supporting limitless many-to-many configurations
    - `global_tasks`: Decoupled universal execution layer 
    - `communications`: Centralized log structure for cross-entity tracing
    
  2. Modifies:
    - Decouples `projects` from strict `organization_id` constraints
    
  3. Security:
    - Standardized RBAC enforcing `tenant_id` scope isolation on the relation maps
*/

-- ==============================================================================
-- 1. DECOUPLE BOUNDARIES
-- ==============================================================================
ALTER TABLE projects ALTER COLUMN organization_id DROP NOT NULL;

-- ==============================================================================
-- 2. MASTER ENTITY LINK REGISTRY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS entity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  source_type text NOT NULL, -- 'organization', 'project', 'task', 'workflow', 'document', 'communication'
  source_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  relationship_type text NOT NULL, -- e.g. 'requires', 'belongs_to', 'blocks', 'spawned_from'
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(source_type, source_id, target_type, target_id, relationship_type)
);

CREATE INDEX idx_entity_links_source ON entity_links(source_type, source_id);
CREATE INDEX idx_entity_links_target ON entity_links(target_type, target_id);
CREATE INDEX idx_entity_links_tenant ON entity_links(tenant_id);

ALTER TABLE entity_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read tenant entity links"
  ON entity_links FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = entity_links.tenant_id
      AND organization_memberships.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Users can manage tenant entity links"
  ON entity_links FOR ALL TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    ) OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = entity_links.tenant_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 3. GLOBAL TASKS ENGINE
-- ==============================================================================
DO $$ BEGIN CREATE TYPE global_task_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE global_task_status AS ENUM ('todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS global_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status global_task_status DEFAULT 'todo' NOT NULL,
  priority global_task_priority DEFAULT 'medium' NOT NULL,
  assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_global_tasks_tenant ON global_tasks(tenant_id);
CREATE INDEX idx_global_tasks_assignee ON global_tasks(assignee_id);
ALTER TABLE global_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenant global tasks"
  ON global_tasks FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = global_tasks.tenant_id
      AND organization_memberships.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Users can manage tenant global tasks"
  ON global_tasks FOR ALL TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    ) OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = global_tasks.tenant_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_global_tasks_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_global_tasks
  BEFORE UPDATE ON global_tasks FOR EACH ROW EXECUTE FUNCTION update_global_tasks_updated_at();

-- ==============================================================================
-- 4. COMMUNICATIONS TRACING
-- ==============================================================================
DO $$ BEGIN CREATE TYPE communication_channel AS ENUM ('email', 'call', 'meeting', 'note', 'message', 'activity'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound', 'internal'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS global_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  channel communication_channel NOT NULL,
  direction communication_direction NOT NULL,
  subject text,
  content text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_global_communications_tenant ON global_communications(tenant_id);
ALTER TABLE global_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tenant communications"
  ON global_communications FOR SELECT TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = global_communications.tenant_id
      AND organization_memberships.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Users can manage tenant communications"
  ON global_communications FOR ALL TO authenticated
  USING (
    tenant_id IS NULL OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    ) OR EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = global_communications.tenant_id
      AND organization_memberships.user_id = auth.uid()
    )
  );
