/*
  # Phase 2: Relationship Governance
  
  1. Audit Logs
    - `entity_link_audit`: Central tracing table logging who connected/disconnected nodes in the intelligence graph.
    - Automatic `audit_entity_links` Postgres trigger function mapping INSERT/DELETE on the matrix.
    
  2. Polymorphic Cascade Deletion
    - Postgres functions mapping DELETE operations off standard entities (`projects`, `organizations`, `documents`, `automations`) and sweeping the polymorphic strings natively.
*/

-- ==============================================================================
-- 1. RELATIONSHIP AUDIT TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS entity_link_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL,
  tenant_id uuid,
  action text NOT NULL, -- 'LINK', 'UNLINK'
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  relationship_type text NOT NULL,
  actor_id uuid,
  timestamp timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_entity_link_audit_tenant ON entity_link_audit(tenant_id);
CREATE INDEX idx_entity_link_audit_source ON entity_link_audit(source_type, source_id);
CREATE INDEX idx_entity_link_audit_target ON entity_link_audit(target_type, target_id);

ALTER TABLE entity_link_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view link audits"
  ON entity_link_audit FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Clients can view tenant link audits"
  ON entity_link_audit FOR SELECT TO authenticated
  USING (
    tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organization_memberships 
      WHERE organization_memberships.organization_id = entity_link_audit.tenant_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 2. AUTOMATIC RELATIONSHIP TRACING TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION audit_entity_links()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO entity_link_audit (link_id, tenant_id, action, source_type, source_id, target_type, target_id, relationship_type, actor_id, timestamp)
    VALUES (OLD.id, OLD.tenant_id, 'UNLINK', OLD.source_type, OLD.source_id, OLD.target_type, OLD.target_id, OLD.relationship_type, auth.uid(), now());
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO entity_link_audit (link_id, tenant_id, action, source_type, source_id, target_type, target_id, relationship_type, actor_id, timestamp)
    VALUES (NEW.id, NEW.tenant_id, 'LINK', NEW.source_type, NEW.source_id, NEW.target_type, NEW.target_id, NEW.relationship_type, NEW.created_by, now());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_audit_entity_links
  AFTER INSERT OR DELETE ON entity_links
  FOR EACH ROW EXECUTE FUNCTION audit_entity_links();

-- ==============================================================================
-- 3. POLYMORPHIC ORPHAN PREVENTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION cascade_entity_links_deletion() 
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM entity_links 
  WHERE source_id = OLD.id OR target_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger connections to fundamental Bridgebox Operating System modules
CREATE TRIGGER tr_cascade_projects AFTER DELETE ON projects FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
CREATE TRIGGER tr_cascade_organizations AFTER DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
CREATE TRIGGER tr_cascade_global_tasks AFTER DELETE ON global_tasks FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
CREATE TRIGGER tr_cascade_global_communications AFTER DELETE ON global_communications FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
CREATE TRIGGER tr_cascade_documents AFTER DELETE ON documents FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();

-- Check if workflows/automations exists safely
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'automations') THEN
    CREATE TRIGGER tr_cascade_automations AFTER DELETE ON automations FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
  END IF;
END $$;
