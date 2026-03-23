/*
  # Client Success and Account Management System

  1. New Tables
    - `client_health_scores`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `overall_score` (integer, 0-100)
      - `onboarding_score` (integer, 0-100)
      - `project_score` (integer, 0-100)
      - `support_score` (integer, 0-100)
      - `engagement_score` (integer, 0-100)
      - `calculated_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `client_interactions`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `interaction_type` (text: 'call', 'email', 'meeting', 'support', 'review')
      - `subject` (text)
      - `notes` (text)
      - `conducted_by` (uuid, references auth.users)
      - `outcome` (text)
      - `follow_up_required` (boolean)
      - `follow_up_date` (date)
      - `interaction_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `account_owners`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations, unique)
      - `owner_id` (uuid, references auth.users)
      - `assigned_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `success_opportunities`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `opportunity_type` (text: 'upsell_dashboard', 'upsell_mobile', 'upsell_automation', 'expansion', 'renewal')
      - `title` (text)
      - `description` (text)
      - `estimated_value` (decimal)
      - `priority` (text: 'low', 'medium', 'high')
      - `status` (text: 'identified', 'proposed', 'negotiating', 'won', 'lost')
      - `identified_by` (uuid, references auth.users)
      - `identified_at` (timestamptz)
      - `closed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `risk_flags`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `risk_type` (text: 'delayed_onboarding', 'overdue_invoice', 'high_support_volume', 'low_engagement', 'churn_risk')
      - `severity` (text: 'low', 'medium', 'high', 'critical')
      - `description` (text)
      - `status` (text: 'active', 'monitoring', 'resolved')
      - `detected_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `assigned_to` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access based on organization membership and role
*/

-- Client Health Scores
CREATE TABLE IF NOT EXISTS client_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100) NOT NULL,
  onboarding_score integer CHECK (onboarding_score >= 0 AND onboarding_score <= 100) NOT NULL DEFAULT 0,
  project_score integer CHECK (project_score >= 0 AND project_score <= 100) NOT NULL DEFAULT 0,
  support_score integer CHECK (support_score >= 0 AND support_score <= 100) NOT NULL DEFAULT 0,
  engagement_score integer CHECK (engagement_score >= 0 AND engagement_score <= 100) NOT NULL DEFAULT 0,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_scores_org ON client_health_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_calculated ON client_health_scores(calculated_at DESC);

ALTER TABLE client_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all health scores"
  ON client_health_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage health scores"
  ON client_health_scores FOR ALL
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

-- Client Interactions
CREATE TABLE IF NOT EXISTS client_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  interaction_type text CHECK (interaction_type IN ('call', 'email', 'meeting', 'support', 'review')) NOT NULL,
  subject text NOT NULL,
  notes text,
  conducted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  outcome text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  interaction_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_org ON client_interactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON client_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_follow_up ON client_interactions(follow_up_required, follow_up_date) WHERE follow_up_required = true;

ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all interactions"
  ON client_interactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Users can view interactions they conducted"
  ON client_interactions FOR SELECT
  TO authenticated
  USING (conducted_by = auth.uid());

CREATE POLICY "Internal staff can insert interactions"
  ON client_interactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can update interactions"
  ON client_interactions FOR UPDATE
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

-- Account Owners
CREATE TABLE IF NOT EXISTS account_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE UNIQUE NOT NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_account_owners_org ON account_owners(organization_id);
CREATE INDEX IF NOT EXISTS idx_account_owners_owner ON account_owners(owner_id);

ALTER TABLE account_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all account owners"
  ON account_owners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Super admin can manage account owners"
  ON account_owners FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Success Opportunities
CREATE TABLE IF NOT EXISTS success_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  opportunity_type text CHECK (opportunity_type IN ('upsell_dashboard', 'upsell_mobile', 'upsell_automation', 'expansion', 'renewal')) NOT NULL,
  title text NOT NULL,
  description text,
  estimated_value decimal(10,2),
  priority text CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  status text CHECK (status IN ('identified', 'proposed', 'negotiating', 'won', 'lost')) DEFAULT 'identified',
  identified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  identified_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_opportunities_org ON success_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON success_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_priority ON success_opportunities(priority);

ALTER TABLE success_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all opportunities"
  ON success_opportunities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage opportunities"
  ON success_opportunities FOR ALL
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

-- Risk Flags
CREATE TABLE IF NOT EXISTS risk_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  risk_type text CHECK (risk_type IN ('delayed_onboarding', 'overdue_invoice', 'high_support_volume', 'low_engagement', 'churn_risk')) NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  description text NOT NULL,
  status text CHECK (status IN ('active', 'monitoring', 'resolved')) DEFAULT 'active',
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_flags_org ON risk_flags(organization_id);
CREATE INDEX IF NOT EXISTS idx_risk_flags_status ON risk_flags(status) WHERE status != 'resolved';
CREATE INDEX IF NOT EXISTS idx_risk_flags_severity ON risk_flags(severity);

ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all risk flags"
  ON risk_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can manage risk flags"
  ON risk_flags FOR ALL
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
