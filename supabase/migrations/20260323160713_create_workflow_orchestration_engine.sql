/*
  # Workflow Orchestration Engine

  This migration creates a comprehensive workflow orchestration system that extends
  the existing automation rules engine to support multi-step workflows with
  conditions, branching, delays, and parallel execution.

  ## New Tables

  ### `workflows`
  Main workflow definitions with triggers, conditions, and activation status

  ### `workflow_steps`
  Individual steps within workflows (actions, conditions, delays, parallel blocks)

  ### `workflow_executions`
  Execution instances tracking status, timing, and results

  ### `workflow_step_executions`
  Individual step execution records with outputs and errors

  ### `workflow_templates`
  Pre-built workflow templates for common scenarios

  ## Security

  RLS enabled on all tables restricting access to organization members
*/

-- ============================================================================
-- WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('lead', 'project', 'billing', 'support', 'custom')),
  version integer DEFAULT 1 NOT NULL,
  is_active boolean DEFAULT false NOT NULL,
  is_template boolean DEFAULT false NOT NULL,
  trigger_type text NOT NULL CHECK (trigger_type IN (
    'lead_created', 'proposal_approved', 'onboarding_completed',
    'project_created', 'support_ticket_created', 'invoice_overdue',
    'manual_trigger', 'scheduled_trigger'
  )),
  trigger_conditions jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_modified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  execution_count integer DEFAULT 0 NOT NULL,
  last_executed_at timestamptz
);

CREATE INDEX idx_workflows_organization ON workflows(organization_id);
CREATE INDEX idx_workflows_category ON workflows(organization_id, category);
CREATE INDEX idx_workflows_active ON workflows(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_workflows_template ON workflows(is_template) WHERE is_template = true;
CREATE INDEX idx_workflows_trigger ON workflows(trigger_type, is_active) WHERE is_active = true;

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization workflows"
  ON workflows FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can create workflows"
  ON workflows FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Admins and staff can update workflows"
  ON workflows FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Super admins can delete workflows"
  ON workflows FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- WORKFLOW STEPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  step_key text NOT NULL,
  step_name text NOT NULL,
  step_type text NOT NULL CHECK (step_type IN ('action', 'condition', 'delay', 'parallel')),
  action_type text CHECK (action_type IN (
    'create_project', 'assign_team_member', 'send_notification',
    'update_status', 'create_task', 'flag_risk', 'send_email',
    'create_proposal', 'update_field'
  )),
  action_config jsonb DEFAULT '{}'::jsonb NOT NULL,
  condition_expression jsonb,
  delay_amount integer CHECK (delay_amount > 0),
  delay_unit text CHECK (delay_unit IN ('minutes', 'hours', 'days')),
  order_index integer DEFAULT 0 NOT NULL,
  parent_step_id uuid REFERENCES workflow_steps(id) ON DELETE CASCADE,
  on_true_step_id uuid REFERENCES workflow_steps(id) ON DELETE SET NULL,
  on_false_step_id uuid REFERENCES workflow_steps(id) ON DELETE SET NULL,
  next_step_id uuid REFERENCES workflow_steps(id) ON DELETE SET NULL,
  position_x integer DEFAULT 0 NOT NULL,
  position_y integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(workflow_id, step_key)
);

CREATE INDEX idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON workflow_steps(workflow_id, order_index);
CREATE INDEX idx_workflow_steps_parent ON workflow_steps(parent_step_id) WHERE parent_step_id IS NOT NULL;
CREATE INDEX idx_workflow_steps_type ON workflow_steps(workflow_id, step_type);

ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow steps"
  ON workflow_steps FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN organization_memberships om ON om.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can manage workflow steps"
  ON workflow_steps FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      JOIN organization_memberships om ON om.organization_id = w.organization_id
      WHERE w.id = workflow_steps.workflow_id
      AND om.user_id = auth.uid()
      AND om.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

-- ============================================================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  trigger_entity_type text NOT NULL,
  trigger_entity_id uuid NOT NULL,
  trigger_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  status text DEFAULT 'running' NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'paused', 'cancelled')),
  current_step_id uuid REFERENCES workflow_steps(id) ON DELETE SET NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  duration_seconds integer,
  error_message text,
  execution_context jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_organization ON workflow_executions(organization_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(organization_id, status);
CREATE INDEX idx_workflow_executions_entity ON workflow_executions(trigger_entity_type, trigger_entity_id);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(organization_id, started_at DESC);

ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization workflow executions"
  ON workflow_executions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflow_executions.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create workflow executions"
  ON workflow_executions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflow_executions.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "System can update workflow executions"
  ON workflow_executions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = workflow_executions.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

-- ============================================================================
-- WORKFLOW STEP EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_step_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_execution_id uuid REFERENCES workflow_executions(id) ON DELETE CASCADE NOT NULL,
  step_id uuid REFERENCES workflow_steps(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  output_data jsonb,
  error_message text,
  retry_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_step_executions_workflow_exec ON workflow_step_executions(workflow_execution_id);
CREATE INDEX idx_step_executions_step ON workflow_step_executions(step_id);
CREATE INDEX idx_step_executions_status ON workflow_step_executions(workflow_execution_id, status);

ALTER TABLE workflow_step_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow step executions"
  ON workflow_step_executions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      JOIN organization_memberships om ON om.organization_id = we.organization_id
      WHERE we.id = workflow_step_executions.workflow_execution_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage workflow step executions"
  ON workflow_step_executions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workflow_executions we
      JOIN organization_memberships om ON om.organization_id = we.organization_id
      WHERE we.id = workflow_step_executions.workflow_execution_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- WORKFLOW TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('lead', 'project', 'billing', 'support', 'custom')),
  icon text,
  template_config jsonb NOT NULL,
  times_used integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workflow templates"
  ON workflow_templates FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_workflow_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_timestamp
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_timestamp();

CREATE TRIGGER trigger_update_workflow_steps_timestamp
  BEFORE UPDATE ON workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_timestamp();

CREATE OR REPLACE FUNCTION calculate_execution_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::integer;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_execution_duration
  BEFORE UPDATE ON workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_execution_duration();

CREATE OR REPLACE FUNCTION increment_workflow_execution_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workflows
  SET
    execution_count = execution_count + 1,
    last_executed_at = NEW.started_at
  WHERE id = NEW.workflow_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_workflow_execution_count
  AFTER INSERT ON workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION increment_workflow_execution_count();