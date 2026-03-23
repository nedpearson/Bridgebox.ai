/*
  # Delivery Management System

  1. New Tables
    - `project_delivery`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `delivery_phase` (text) - discovery, planning, design, build, integration, qa, deployment, support
      - `health_status` (text) - green, yellow, red
      - `current_milestone` (text)
      - `completion_percentage` (integer)
      - `risk_level` (text) - none, low, medium, high, critical
      - `team_lead_id` (uuid, references auth.users)
      - `start_date` (date)
      - `target_completion_date` (date)
      - `actual_completion_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `milestones`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `title` (text)
      - `description` (text)
      - `due_date` (date)
      - `status` (text) - not_started, in_progress, at_risk, completed, blocked
      - `owner_id` (uuid, references auth.users)
      - `completion_date` (date)
      - `order_index` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `deliverables`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `milestone_id` (uuid, references milestones)
      - `type` (text) - documentation, design, code, dashboard, mobile_app, integration, deployment, training
      - `title` (text)
      - `description` (text)
      - `status` (text) - pending, in_progress, review, approved, delivered
      - `file_references` (jsonb)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `delivery_notes`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `author_id` (uuid, references auth.users)
      - `note_type` (text) - update, risk, blocker, decision, client_feedback
      - `content` (text)
      - `is_critical` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Internal staff can view/manage all delivery data
    - Clients have limited visibility through client portal

  3. Indexes
    - Index on project_id for all tables
    - Index on delivery_phase for filtering
    - Index on health_status for monitoring
    - Index on due_date for milestones
    - Index on status for deliverables
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS delivery_notes CASCADE;
DROP TABLE IF EXISTS deliverables CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS project_delivery CASCADE;

-- Create project_delivery table
CREATE TABLE project_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL UNIQUE,
  delivery_phase text DEFAULT 'discovery' CHECK (delivery_phase IN ('discovery', 'planning', 'design', 'build', 'integration', 'qa', 'deployment', 'support')),
  health_status text DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
  current_milestone text,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  risk_level text DEFAULT 'none' CHECK (risk_level IN ('none', 'low', 'medium', 'high', 'critical')),
  team_lead_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  start_date date,
  target_completion_date date,
  actual_completion_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create milestones table
CREATE TABLE milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  due_date date,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed', 'blocked')),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  completion_date date,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create deliverables table
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  milestone_id uuid REFERENCES milestones(id) ON DELETE SET NULL,
  type text DEFAULT 'documentation' CHECK (type IN ('documentation', 'design', 'code', 'dashboard', 'mobile_app', 'integration', 'deployment', 'training')),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'approved', 'delivered')),
  file_references jsonb DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create delivery_notes table
CREATE TABLE delivery_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note_type text DEFAULT 'update' CHECK (note_type IN ('update', 'risk', 'blocker', 'decision', 'client_feedback')),
  content text NOT NULL,
  is_critical boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE project_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_notes ENABLE ROW LEVEL SECURITY;

-- Project Delivery Policies

CREATE POLICY "Internal staff can view all delivery"
  ON project_delivery
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage delivery"
  ON project_delivery
  FOR ALL
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

-- Milestones Policies

CREATE POLICY "Internal staff can view all milestones"
  ON milestones
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage milestones"
  ON milestones
  FOR ALL
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

-- Deliverables Policies

CREATE POLICY "Internal staff can view all deliverables"
  ON deliverables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage deliverables"
  ON deliverables
  FOR ALL
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

-- Delivery Notes Policies

CREATE POLICY "Internal staff can view all delivery notes"
  ON delivery_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage delivery notes"
  ON delivery_notes
  FOR ALL
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

-- Create indexes
CREATE INDEX idx_project_delivery_project_id ON project_delivery(project_id);
CREATE INDEX idx_project_delivery_phase ON project_delivery(delivery_phase);
CREATE INDEX idx_project_delivery_health ON project_delivery(health_status);
CREATE INDEX idx_project_delivery_risk ON project_delivery(risk_level);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_deliverables_project_id ON deliverables(project_id);
CREATE INDEX idx_deliverables_milestone_id ON deliverables(milestone_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_delivery_notes_project_id ON delivery_notes(project_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_delivery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_project_delivery_updated_at
  BEFORE UPDATE ON project_delivery
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_updated_at();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_updated_at();

CREATE TRIGGER update_deliverables_updated_at
  BEFORE UPDATE ON deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_updated_at();