/*
  # White-Label and Enterprise Tenant Control System

  ## Overview
  Creates comprehensive white-label capabilities for enterprise customization.

  ## New Tables

  ### `organization_branding`
  Stores branding and visual customization settings per organization.

  ### `organization_feature_flags`
  Controls feature availability per organization.

  ### `custom_roles`
  Defines custom role templates per organization.

  ### `plan_features`
  Maps features to subscription plans.

  ## Security
  - Enable RLS on all tables
  - Only super_admin can modify branding
  - Organization members can view branding
  - Feature flags enforced at application level
*/

-- Create organization_branding table
CREATE TABLE IF NOT EXISTS organization_branding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  logo_url text,
  logo_light_url text,
  logo_dark_url text,
  favicon_url text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#1e293b',
  accent_color text DEFAULT '#10b981',
  company_name text,
  tagline text,
  custom_domain text,
  support_email text,
  support_phone text,
  custom_css text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create organization_feature_flags table
CREATE TABLE IF NOT EXISTS organization_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  feature_key text NOT NULL,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb,
  enabled_at timestamptz,
  enabled_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, feature_key)
);

-- Create custom_roles table
CREATE TABLE IF NOT EXISTS custom_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  inherits_from text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Create plan_features table
CREATE TABLE IF NOT EXISTS plan_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id text NOT NULL,
  feature_key text NOT NULL,
  included boolean DEFAULT true,
  limit_value integer,
  limit_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  UNIQUE(plan_id, feature_key)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_org_branding_org ON organization_branding(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_org ON organization_feature_flags(organization_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON organization_feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_custom_roles_org ON custom_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_roles_active ON custom_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_key ON plan_features(feature_key);

-- Enable RLS
ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_branding
CREATE POLICY "Organization members can view branding"
  ON organization_branding FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can update branding"
  ON organization_branding FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can insert branding"
  ON organization_branding FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  );

-- RLS Policies for organization_feature_flags
CREATE POLICY "Organization members can view feature flags"
  ON organization_feature_flags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_feature_flags.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage feature flags"
  ON organization_feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_feature_flags.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_feature_flags.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  );

-- RLS Policies for custom_roles
CREATE POLICY "Organization members can view custom roles"
  ON custom_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = custom_roles.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage custom roles"
  ON custom_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = custom_roles.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = custom_roles.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  );

-- RLS Policies for plan_features
CREATE POLICY "Anyone can view plan features"
  ON plan_features FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only super admins can manage plan features"
  ON plan_features FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.user_id = auth.uid()
      AND organization_memberships.role = 'super_admin'
    )
  );

-- Insert default plan features
INSERT INTO plan_features (plan_id, feature_key, included, limit_value, limit_type) VALUES
  ('starter', 'crm', true, 100, 'leads'),
  ('starter', 'analytics', true, NULL, NULL),
  ('starter', 'support', true, 1, 'agents'),
  ('starter', 'automation', false, NULL, NULL),
  ('starter', 'ai_copilot', false, NULL, NULL),
  ('starter', 'custom_branding', false, NULL, NULL),

  ('professional', 'crm', true, 1000, 'leads'),
  ('professional', 'analytics', true, NULL, NULL),
  ('professional', 'support', true, 3, 'agents'),
  ('professional', 'automation', true, 10, 'workflows'),
  ('professional', 'ai_copilot', true, 100, 'requests_per_day'),
  ('professional', 'custom_branding', true, NULL, NULL),

  ('enterprise', 'crm', true, NULL, NULL),
  ('enterprise', 'analytics', true, NULL, NULL),
  ('enterprise', 'support', true, NULL, NULL),
  ('enterprise', 'automation', true, NULL, NULL),
  ('enterprise', 'ai_copilot', true, NULL, NULL),
  ('enterprise', 'custom_branding', true, NULL, NULL),
  ('enterprise', 'custom_domain', true, NULL, NULL),
  ('enterprise', 'sso', true, NULL, NULL),
  ('enterprise', 'custom_roles', true, NULL, NULL)
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_white_label_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_organization_branding_updated_at
  BEFORE UPDATE ON organization_branding
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_updated_at();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON organization_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_updated_at();

CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_updated_at();
