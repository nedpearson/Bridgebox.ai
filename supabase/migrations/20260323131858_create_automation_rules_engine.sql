/*
  # Automation Rules Engine

  1. New Tables
    - `automation_rules`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `trigger_type` (text: 'lead_created', 'proposal_approved', 'onboarding_completed', 'project_created', 'support_ticket_created', 'invoice_overdue')
      - `trigger_conditions` (jsonb) - additional conditions for trigger
      - `action_type` (text: 'create_project', 'assign_team_member', 'send_notification', 'update_status', 'create_task', 'flag_risk')
      - `action_config` (jsonb) - configuration for the action
      - `is_active` (boolean)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `automation_executions`
      - `id` (uuid, primary key)
      - `rule_id` (uuid, references automation_rules)
      - `trigger_entity_type` (text) - lead, proposal, etc.
      - `trigger_entity_id` (uuid) - ID of the entity that triggered it
      - `status` (text: 'pending', 'success', 'failed')
      - `error_message` (text)
      - `executed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for internal staff only
*/

-- Automation Rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  trigger_type text CHECK (trigger_type IN (
    'lead_created',
    'proposal_approved',
    'onboarding_completed',
    'project_created',
    'support_ticket_created',
    'invoice_overdue'
  )) NOT NULL,
  trigger_conditions jsonb DEFAULT '{}'::jsonb,
  action_type text CHECK (action_type IN (
    'create_project',
    'assign_team_member',
    'send_notification',
    'update_status',
    'create_task',
    'flag_risk'
  )) NOT NULL,
  action_config jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view automation rules"
  ON automation_rules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage automation rules"
  ON automation_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Automation Executions
CREATE TABLE IF NOT EXISTS automation_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE CASCADE NOT NULL,
  trigger_entity_type text NOT NULL,
  trigger_entity_id uuid NOT NULL,
  status text CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
  error_message text,
  executed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_executions_rule ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_executions_entity ON automation_executions(trigger_entity_type, trigger_entity_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_executed ON automation_executions(executed_at DESC);

ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view automation executions"
  ON automation_executions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can insert automation executions"
  ON automation_executions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can update automation executions"
  ON automation_executions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );
