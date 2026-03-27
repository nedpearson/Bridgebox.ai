/*
  # Complete Bridgebox Platform Schema

  ## New Tables
  - profiles - User profiles
  - organizations - Client/internal organizations  
  - organization_memberships - User-org relationships
  - proposals - Project proposals
  - projects - Active projects
  - project_milestones - Project milestones
  - deliverables - Project deliverables
  - subscription_plans - Subscription tiers
  - subscriptions - Client subscriptions
  - invoices - Billing invoices
  - support_tickets - Support requests
  - integrations - Third-party integrations

  ## Security
  All tables have RLS enabled with role-based policies
*/

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('super_admin', 'internal_staff', 'client_admin', 'client_member'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE organization_type AS ENUM ('internal', 'client'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE proposal_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE project_type AS ENUM ('dashboard', 'mobile_app', 'web_app', 'integration', 'consulting', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE project_status AS ENUM ('planning', 'in_progress', 'testing', 'deployed', 'on_hold', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'delayed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE deliverable_type AS ENUM ('dashboard', 'mobile_app', 'documentation', 'integration', 'api', 'design', 'other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE deliverable_status AS ENUM ('pending', 'in_progress', 'review', 'delivered', 'approved'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'cancelled', 'paused'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_on_client', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role user_role NOT NULL DEFAULT 'client_member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type organization_type NOT NULL DEFAULT 'client',
  website text,
  logo_url text,
  industry text,
  size text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Organization memberships
CREATE TABLE IF NOT EXISTS organization_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client_member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own memberships" ON organization_memberships;
DROP POLICY IF EXISTS "Internal staff can read all memberships" ON organization_memberships;
CREATE POLICY "Users can read own memberships" ON organization_memberships FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Internal staff can read all memberships" ON organization_memberships FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));

DROP POLICY IF EXISTS "Internal staff can read all organizations" ON organizations;
DROP POLICY IF EXISTS "Users can read their organizations" ON organizations;
CREATE POLICY "Internal staff can read all organizations" ON organizations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Users can read their organizations" ON organizations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = organizations.id AND organization_memberships.user_id = auth.uid()));

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  proposal_number text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  status proposal_status NOT NULL DEFAULT 'draft',
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  valid_until date,
  sent_at timestamptz,
  accepted_at timestamptz,
  created_by_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff can manage all proposals" ON proposals;
DROP POLICY IF EXISTS "Clients can read their proposals" ON proposals;
CREATE POLICY "Internal staff can manage all proposals" ON proposals FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients can read their proposals" ON proposals FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = proposals.organization_id AND organization_memberships.user_id = auth.uid()));

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type project_type NOT NULL DEFAULT 'web_app',
  status project_status NOT NULL DEFAULT 'planning',
  start_date date,
  target_launch_date date,
  actual_launch_date date,
  budget numeric(10, 2),
  contract_value numeric(10, 2),
  progress_percentage integer NOT NULL DEFAULT 0,
  repository_url text,
  staging_url text,
  production_url text,
  notes text,
  project_manager_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff can manage all projects" ON projects;
DROP POLICY IF EXISTS "Clients can read their projects" ON projects;
CREATE POLICY "Internal staff can manage all projects" ON projects FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients can read their projects" ON projects FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = projects.organization_id AND organization_memberships.user_id = auth.uid()));

-- Project milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  target_date date,
  completion_date date,
  status milestone_status NOT NULL DEFAULT 'pending',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read milestones" ON project_milestones;
CREATE POLICY "Users can read milestones" ON project_milestones FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_milestones.project_id AND (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')) OR EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = projects.organization_id AND organization_memberships.user_id = auth.uid()))));

-- Deliverables
CREATE TABLE IF NOT EXISTS deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  deliverable_type deliverable_type NOT NULL DEFAULT 'other',
  status deliverable_status NOT NULL DEFAULT 'pending',
  url text,
  file_path text,
  delivered_date timestamptz,
  approved_date timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read deliverables" ON deliverables;
CREATE POLICY "Users can read deliverables" ON deliverables FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')) OR EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = projects.organization_id AND organization_memberships.user_id = auth.uid()))));

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL,
  price_monthly numeric(10, 2) NOT NULL,
  price_yearly numeric(10, 2),
  features jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active plans" ON subscription_plans;
CREATE POLICY "Anyone can read active plans" ON subscription_plans FOR SELECT TO authenticated USING (is_active = true);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  status subscription_status NOT NULL DEFAULT 'active',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  current_period_start date NOT NULL,
  current_period_end date NOT NULL,
  mrr numeric(10, 2) NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Clients read their subscriptions" ON subscriptions;
CREATE POLICY "Internal staff manage subscriptions" ON subscriptions FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients read their subscriptions" ON subscriptions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = subscriptions.organization_id AND organization_memberships.user_id = auth.uid()));

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date date NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  tax numeric(10, 2) NOT NULL DEFAULT 0,
  total numeric(10, 2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff manage invoices" ON invoices;
DROP POLICY IF EXISTS "Clients read their invoices" ON invoices;
CREATE POLICY "Internal staff manage invoices" ON invoices FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients read their invoices" ON invoices FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = invoices.organization_id AND organization_memberships.user_id = auth.uid()));

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  category text,
  created_by_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff manage tickets" ON support_tickets;
DROP POLICY IF EXISTS "Clients manage their tickets" ON support_tickets;
CREATE POLICY "Internal staff manage tickets" ON support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients manage their tickets" ON support_tickets FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = support_tickets.organization_id AND organization_memberships.user_id = auth.uid()));

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  provider text NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Internal staff manage integrations" ON integrations;
DROP POLICY IF EXISTS "Clients read their integrations" ON integrations;
CREATE POLICY "Internal staff manage integrations" ON integrations FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'internal_staff')));
CREATE POLICY "Clients read their integrations" ON integrations FOR SELECT TO authenticated USING (organization_id IS NOT NULL AND EXISTS (SELECT 1 FROM organization_memberships WHERE organization_memberships.organization_id = integrations.organization_id AND organization_memberships.user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org ON organization_memberships(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_org ON proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_tickets_org ON support_tickets(organization_id);
