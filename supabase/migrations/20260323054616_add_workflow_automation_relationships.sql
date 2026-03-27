/*
  # Workflow Automation Relationships

  1. Purpose
    - Connect lead → proposal → project → delivery lifecycle
    - Enable automated project creation from proposals
    - Track onboarding completion status
    - Link proposals back to originating leads

  2. Changes
    - Add proposal_id to projects table
    - Add onboarding_status to organizations
    - Add converted_to_project flag to proposals
    - Add source tracking to projects
    - Add project template type tracking

  3. Benefits
    - Full traceability from lead to delivery
    - Automated workflow transitions
    - Reduced manual data entry
    - Better pipeline visibility
*/

-- Add proposal_id to projects table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'proposal_id') THEN
    ALTER TABLE projects ADD COLUMN proposal_id uuid;
    CREATE INDEX IF NOT EXISTS idx_projects_proposal_id ON projects(proposal_id) WHERE proposal_id IS NOT NULL;
  END IF;
END $$;

-- Add converted_to_project flag to proposals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'converted_to_project') THEN
    ALTER TABLE proposals ADD COLUMN converted_to_project boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_proposals_converted ON proposals(converted_to_project);
  END IF;
END $$;

-- Add converted_at timestamp to proposals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'converted_at') THEN
    ALTER TABLE proposals ADD COLUMN converted_at timestamptz;
  END IF;
END $$;

-- Create onboarding_status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
    CREATE TYPE onboarding_status AS ENUM (
      'not_started',
      'in_progress',
      'completed',
      'skipped'
    );
  END IF;
END $$;

-- Add onboarding_status to organizations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'onboarding_status') THEN
    ALTER TABLE organizations ADD COLUMN onboarding_status onboarding_status DEFAULT 'not_started';
    CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_status ON organizations(onboarding_status);
  END IF;
END $$;

-- Add onboarding_completed_at to organizations
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'onboarding_completed_at') THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;

-- Add source tracking to projects
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'source') THEN
    ALTER TABLE projects ADD COLUMN source text DEFAULT 'manual';
    CREATE INDEX IF NOT EXISTS idx_projects_source ON projects(source);
  END IF;
END $$;

-- Add template_applied to projects for scaffolding
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'template_applied') THEN
    ALTER TABLE projects ADD COLUMN template_applied boolean DEFAULT false;
  END IF;
END $$;

-- Add converted_to_client flag to leads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'converted_to_client') THEN
    ALTER TABLE leads ADD COLUMN converted_to_client boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads(converted_to_client);
  END IF;
END $$;

-- Add converted_at timestamp to leads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'converted_at') THEN
    ALTER TABLE leads ADD COLUMN converted_at timestamptz;
  END IF;
END $$;

-- Add organization_id to leads for linking
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization_id') THEN
    ALTER TABLE leads ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id) WHERE organization_id IS NOT NULL;
  END IF;
END $$;

-- Create view for proposal pipeline with relationships
CREATE OR REPLACE VIEW proposal_pipeline AS
SELECT
  p.id,
  p.title,
  p.status,
  p.pricing_amount,
  p.created_at,
  p.converted_to_project,
  p.converted_at,
  p.organization_id,
  o.name as client_name,
  o.onboarding_status,
  p.lead_id,
  l.name as lead_name,
  l.status as lead_status,
  pr.id as project_id,
  pr.name as project_name,
  pr.status as project_status
FROM proposals p
LEFT JOIN organizations o ON p.organization_id = o.id
LEFT JOIN leads l ON p.lead_id = l.id
LEFT JOIN projects pr ON pr.proposal_id = p.id;

-- Create view for conversion tracking
CREATE OR REPLACE VIEW conversion_tracking AS
SELECT
  l.id as lead_id,
  l.name as lead_name,
  l.status as lead_status,
  l.converted_to_client,
  l.converted_at as lead_converted_at,
  l.organization_id,
  o.name as organization_name,
  o.onboarding_status,
  o.onboarding_completed_at,
  p.id as proposal_id,
  p.title as proposal_title,
  p.status as proposal_status,
  p.converted_to_project,
  p.converted_at as proposal_converted_at,
  pr.id as project_id,
  pr.name as project_name,
  pr.status as project_status,
  pr.source as project_source
FROM leads l
LEFT JOIN organizations o ON l.organization_id = o.id
LEFT JOIN proposals p ON p.lead_id = l.id
LEFT JOIN projects pr ON pr.proposal_id = p.id
WHERE l.converted_to_client = true OR p.id IS NOT NULL OR pr.id IS NOT NULL;

-- Grant appropriate permissions on views
GRANT SELECT ON proposal_pipeline TO authenticated;
GRANT SELECT ON conversion_tracking TO authenticated;
