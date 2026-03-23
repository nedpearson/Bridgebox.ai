/*
  # Implementation & Deployment Tracking System

  1. New Tables
    - `project_implementations`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `deployment_phase` (enum: setup, integration, testing, staging, production, post_launch_support)
      - `deployment_readiness` (enum: not_ready, in_progress, ready, deployed)
      - `launch_status` (enum: pending, ready, deployed, rolled_back)
      - `staging_url` (text)
      - `production_url` (text)
      - `last_deployment_at` (timestamptz)
      - `notes` (text)
      - Timestamps

    - `implementation_checklists`
      - `id` (uuid, primary key)
      - `implementation_id` (uuid, references project_implementations)
      - `category` (text: infrastructure, integration, migration, qa, approval, launch)
      - `item_title` (text)
      - `item_description` (text)
      - `is_completed` (boolean)
      - `completed_at` (timestamptz)
      - `completed_by_id` (uuid, references users)
      - `order_index` (integer)
      - Timestamps

    - `implementation_environments`
      - `id` (uuid, primary key)
      - `implementation_id` (uuid, references project_implementations)
      - `environment_type` (enum: staging, production)
      - `status` (enum: not_configured, configuring, active, error, maintenance)
      - `url` (text)
      - `last_health_check` (timestamptz)
      - `configuration_notes` (text)
      - Timestamps

    - `implementation_risks`
      - `id` (uuid, primary key)
      - `implementation_id` (uuid, references project_implementations)
      - `risk_type` (enum: blocker, dependency, technical, client, timeline)
      - `severity` (enum: low, medium, high, critical)
      - `title` (text)
      - `description` (text)
      - `status` (enum: open, investigating, mitigated, resolved)
      - `assigned_to_id` (uuid, references users)
      - `resolved_at` (timestamptz)
      - Timestamps

  2. Security
    - Enable RLS on all tables
    - Internal staff can manage all implementations
    - Clients can view their own implementations (read-only)
*/

-- Create deployment phase enum
DO $$ BEGIN
  CREATE TYPE deployment_phase AS ENUM (
    'setup',
    'integration',
    'testing',
    'staging',
    'production',
    'post_launch_support'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create deployment readiness enum
DO $$ BEGIN
  CREATE TYPE deployment_readiness AS ENUM (
    'not_ready',
    'in_progress',
    'ready',
    'deployed'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create launch status enum
DO $$ BEGIN
  CREATE TYPE launch_status AS ENUM (
    'pending',
    'ready',
    'deployed',
    'rolled_back'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create environment type enum
DO $$ BEGIN
  CREATE TYPE environment_type AS ENUM (
    'staging',
    'production'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create environment status enum
DO $$ BEGIN
  CREATE TYPE environment_status AS ENUM (
    'not_configured',
    'configuring',
    'active',
    'error',
    'maintenance'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create risk type enum
DO $$ BEGIN
  CREATE TYPE risk_type AS ENUM (
    'blocker',
    'dependency',
    'technical',
    'client',
    'timeline'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create risk status enum
DO $$ BEGIN
  CREATE TYPE risk_status AS ENUM (
    'open',
    'investigating',
    'mitigated',
    'resolved'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create project implementations table
CREATE TABLE IF NOT EXISTS project_implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  deployment_phase deployment_phase DEFAULT 'setup' NOT NULL,
  deployment_readiness deployment_readiness DEFAULT 'not_ready' NOT NULL,
  launch_status launch_status DEFAULT 'pending' NOT NULL,
  staging_url text,
  production_url text,
  last_deployment_at timestamptz,
  go_live_date date,
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create implementation checklists table
CREATE TABLE IF NOT EXISTS implementation_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid REFERENCES project_implementations(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('infrastructure', 'integration', 'migration', 'qa', 'approval', 'launch')),
  item_title text NOT NULL,
  item_description text,
  is_completed boolean DEFAULT false NOT NULL,
  completed_at timestamptz,
  completed_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  order_index integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create implementation environments table
CREATE TABLE IF NOT EXISTS implementation_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid REFERENCES project_implementations(id) ON DELETE CASCADE NOT NULL,
  environment_type environment_type NOT NULL,
  status environment_status DEFAULT 'not_configured' NOT NULL,
  url text,
  last_health_check timestamptz,
  configuration_notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(implementation_id, environment_type)
);

-- Create implementation risks table
CREATE TABLE IF NOT EXISTS implementation_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  implementation_id uuid REFERENCES project_implementations(id) ON DELETE CASCADE NOT NULL,
  risk_type risk_type NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  status risk_status DEFAULT 'open' NOT NULL,
  assigned_to_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE project_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_implementations
CREATE POLICY "Internal staff can manage all implementations"
  ON project_implementations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  );

CREATE POLICY "Clients can view their implementations"
  ON project_implementations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN organization_memberships om ON om.organization_id = p.organization_id
      WHERE p.id = project_implementations.project_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for implementation_checklists
CREATE POLICY "Internal staff can manage all checklists"
  ON implementation_checklists
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  );

CREATE POLICY "Clients can view their checklists"
  ON implementation_checklists
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_implementations pi
      JOIN projects p ON p.id = pi.project_id
      JOIN organization_memberships om ON om.organization_id = p.organization_id
      WHERE pi.id = implementation_checklists.implementation_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for implementation_environments
CREATE POLICY "Internal staff can manage all environments"
  ON implementation_environments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  );

CREATE POLICY "Clients can view their environments"
  ON implementation_environments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_implementations pi
      JOIN projects p ON p.id = pi.project_id
      JOIN organization_memberships om ON om.organization_id = p.organization_id
      WHERE pi.id = implementation_environments.implementation_id
      AND om.user_id = auth.uid()
    )
  );

-- RLS Policies for implementation_risks
CREATE POLICY "Internal staff can manage all risks"
  ON implementation_risks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND o.type = 'internal'
    )
  );

CREATE POLICY "Clients can view their risks"
  ON implementation_risks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_implementations pi
      JOIN projects p ON p.id = pi.project_id
      JOIN organization_memberships om ON om.organization_id = p.organization_id
      WHERE pi.id = implementation_risks.implementation_id
      AND om.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_implementations_project_id ON project_implementations(project_id);
CREATE INDEX IF NOT EXISTS idx_implementation_checklists_implementation_id ON implementation_checklists(implementation_id);
CREATE INDEX IF NOT EXISTS idx_implementation_checklists_category ON implementation_checklists(category);
CREATE INDEX IF NOT EXISTS idx_implementation_environments_implementation_id ON implementation_environments(implementation_id);
CREATE INDEX IF NOT EXISTS idx_implementation_risks_implementation_id ON implementation_risks(implementation_id);
CREATE INDEX IF NOT EXISTS idx_implementation_risks_status ON implementation_risks(status);
CREATE INDEX IF NOT EXISTS idx_implementation_risks_severity ON implementation_risks(severity);