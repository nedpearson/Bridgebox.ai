/*
  # Agent Actions System

  1. New Tables
    - `agent_actions`
      - Stores all AI-suggested actions
      - Tracks approval workflow
      - Execution history and results
      - Human-in-the-loop controls

  2. Security
    - Enable RLS on all tables
    - Internal staff can manage actions
    - Users can review and approve actions

  3. Indexes
    - Performance indexes on status, category, priority
    - Filter by entity and organization
*/

-- Create enums for action system
DO $$ BEGIN
  CREATE TYPE action_category AS ENUM ('crm', 'proposal', 'project', 'support', 'strategy', 'automation');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE action_status AS ENUM ('suggested', 'pending_review', 'approved', 'executed', 'dismissed', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE action_priority AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Agent actions table
CREATE TABLE IF NOT EXISTS agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Classification
  category action_category NOT NULL,
  action_type text NOT NULL,
  title text NOT NULL,
  description text,

  -- Context
  context jsonb DEFAULT '{}'::jsonb NOT NULL,
  reasoning jsonb DEFAULT '{}'::jsonb NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb NOT NULL,

  -- Scoring and priority
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100) NOT NULL,
  priority action_priority NOT NULL,
  requires_approval boolean DEFAULT true,
  is_destructive boolean DEFAULT false,

  -- Workflow
  status action_status DEFAULT 'suggested' NOT NULL,
  suggested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewer_notes text,
  executed_at timestamptz,
  execution_result jsonb,
  error_message text,

  -- Lifecycle
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agent_actions_org ON agent_actions(organization_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_status ON agent_actions(status);
CREATE INDEX IF NOT EXISTS idx_agent_actions_category ON agent_actions(category);
CREATE INDEX IF NOT EXISTS idx_agent_actions_priority ON agent_actions(priority);
CREATE INDEX IF NOT EXISTS idx_agent_actions_suggested ON agent_actions(suggested_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_entity ON agent_actions((context->>'entity_type'), (context->>'entity_id'));
CREATE INDEX IF NOT EXISTS idx_agent_actions_requires_approval ON agent_actions(requires_approval) WHERE status = 'pending_review';

-- Enable Row Level Security
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view actions in their organization"
  ON agent_actions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Internal staff can create actions"
  ON agent_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Users can update actions in their organization"
  ON agent_actions FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Internal staff can delete actions"
  ON agent_actions FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agent_actions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_agent_actions_updated_at ON agent_actions;
CREATE TRIGGER update_agent_actions_updated_at
  BEFORE UPDATE ON agent_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_actions_updated_at();

-- Function to auto-expire old suggested actions
CREATE OR REPLACE FUNCTION expire_old_agent_actions()
RETURNS void AS $$
BEGIN
  UPDATE agent_actions
  SET status = 'dismissed'
  WHERE status IN ('suggested', 'pending_review')
    AND expires_at IS NOT NULL
    AND expires_at < now();
END;
$$ LANGUAGE plpgsql;
