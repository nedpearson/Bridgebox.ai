-- ==============================================================================
-- Migration: Harden AI Support Vectors (Parameter Tampering Protection)
-- Description: Enforces Column-Level protection on support_tickets to prevent
--              Tenant accounts from overwriting internal AI/Escalation metadata
--              via direct API mutations. 
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.protect_internal_support_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_role text;
BEGIN
  -- Resolve the acting user's role from the application profile
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

  -- If the user is an internal system actor, bypass protections
  IF v_role IN ('super_admin', 'internal_staff') THEN
    RETURN NEW;
  END IF;

  -- For standard Tenants (or unauthenticated bypass attempts), enforce immutability 
  -- on all AI and internal escalation columns. Reject NEW values and restore OLD.
  NEW.ai_summary = OLD.ai_summary;
  NEW.ai_category = OLD.ai_category;
  NEW.ai_severity = OLD.ai_severity;
  NEW.ai_urgency = OLD.ai_urgency;
  NEW.ai_confidence = OLD.ai_confidence;
  NEW.ai_product_area = OLD.ai_product_area;
  NEW.ai_recommended_action = OLD.ai_recommended_action;
  NEW.ai_possible_duplicate_refs = OLD.ai_possible_duplicate_refs;
  NEW.ai_status = OLD.ai_status;
  NEW.ai_processed_at = OLD.ai_processed_at;
  NEW.ai_error = OLD.ai_error;
  
  NEW.escalation_type = OLD.escalation_type;
  NEW.feature_gap_flag = OLD.feature_gap_flag;
  NEW.recurring_issue_flag = OLD.recurring_issue_flag;
  NEW.onboarding_gap_flag = OLD.onboarding_gap_flag;
  NEW.build_candidate_flag = OLD.build_candidate_flag;
  NEW.proposed_solution = OLD.proposed_solution;
  NEW.internal_priority = OLD.internal_priority;
  NEW.linked_internal_recording_id = OLD.linked_internal_recording_id;
  NEW.linked_internal_note_id = OLD.linked_internal_note_id;

  -- Organization boundaries and ticket IDs are inherently immutable by Tenants
  NEW.organization_id = OLD.organization_id;
  NEW.created_by_id = OLD.created_by_id;
  
  -- Restore the resolution tracking if tampered
  NEW.resolved_at = OLD.resolved_at;
  NEW.resolution_notes = OLD.resolution_notes;

  RETURN NEW;
END;
$$;

-- Attach the trigger to fire BEFORE UPDATE on support_tickets
DROP TRIGGER IF EXISTS trg_protect_internal_support_fields ON public.support_tickets;
CREATE TRIGGER trg_protect_internal_support_fields
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_internal_support_fields();
