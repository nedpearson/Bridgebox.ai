/*
  # Expanding Entity Link Governance to Uncovered Polymorphic Targets
  
  Prevents Orphaned Relationship graphs when nodes like workflows and proposals
  are structurally severed via Data Layer `.delete()` actions.
*/

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'workflows') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'tr_cascade_workflows') THEN
      CREATE TRIGGER tr_cascade_workflows AFTER DELETE ON workflows FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
    END IF;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'proposals') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'tr_cascade_proposals') THEN
      CREATE TRIGGER tr_cascade_proposals AFTER DELETE ON proposals FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
    END IF;
  END IF;

  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') THEN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'tr_cascade_invoices') THEN
      CREATE TRIGGER tr_cascade_invoices AFTER DELETE ON invoices FOR EACH ROW EXECUTE FUNCTION cascade_entity_links_deletion();
    END IF;
  END IF;
END $$;

-- High Velocity RPC for Relational Metrics
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
  FROM entity_links
  WHERE (source_type = p_entity_type AND source_id = p_entity_id)
     OR (target_type = p_entity_type AND target_id = p_entity_id)
  GROUP BY 
    CASE 
      WHEN source_id = p_entity_id THEN target_type
      ELSE source_type
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
