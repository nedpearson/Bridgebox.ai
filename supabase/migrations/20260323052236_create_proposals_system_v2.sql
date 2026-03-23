/*
  # Proposal Generator System

  1. New Tables
    - `proposals`
      - `id` (uuid, primary key)
      - `title` (text)
      - `organization_id` (uuid, references organizations)
      - `lead_id` (uuid, references leads, nullable)
      - `client_name` (text)
      - `client_email` (text)
      - `service_types` (text[]) - array of service types
      - `scope_summary` (text)
      - `deliverables` (jsonb) - array of deliverable objects
      - `timeline_estimate` (text)
      - `pricing_model` (text) - fixed_project, milestone_based, monthly_retainer, custom_enterprise
      - `pricing_amount` (decimal)
      - `optional_addons` (jsonb) - array of addon objects
      - `internal_notes` (text)
      - `status` (text) - draft, internal_review, sent, viewed, approved, declined, expired
      - `created_by` (uuid, references auth.users)
      - `sent_at` (timestamptz)
      - `viewed_at` (timestamptz)
      - `approved_at` (timestamptz)
      - `declined_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `share_token` (text, unique) - for client-facing sharing
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on proposals table
    - Internal staff can manage all proposals
    - Client admins can view proposals for their organization
    - Public can view proposals with valid share token

  3. Indexes
    - Index on organization_id for filtering
    - Index on lead_id for linking
    - Index on status for filtering
    - Index on share_token for public access
    - Index on created_by for user queries
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS proposals CASCADE;

-- Create proposals table
CREATE TABLE proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text,
  service_types text[] DEFAULT '{}',
  scope_summary text,
  deliverables jsonb DEFAULT '[]',
  timeline_estimate text,
  pricing_model text DEFAULT 'fixed_project' CHECK (pricing_model IN ('fixed_project', 'milestone_based', 'monthly_retainer', 'custom_enterprise')),
  pricing_amount decimal(12, 2),
  optional_addons jsonb DEFAULT '[]',
  internal_notes text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'internal_review', 'sent', 'viewed', 'approved', 'declined', 'expired')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at timestamptz,
  viewed_at timestamptz,
  approved_at timestamptz,
  declined_at timestamptz,
  expires_at timestamptz,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Policy: Internal staff can view all proposals
CREATE POLICY "Internal staff can view all proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Client admins can view their organization's proposals
CREATE POLICY "Client admins can view org proposals"
  ON proposals
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'client_member')
    )
  );

-- Policy: Internal staff can create proposals
CREATE POLICY "Internal staff can create proposals"
  ON proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Internal staff can update all proposals
CREATE POLICY "Internal staff can update all proposals"
  ON proposals
  FOR UPDATE
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

-- Policy: Internal staff can delete proposals
CREATE POLICY "Internal staff can delete proposals"
  ON proposals
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Create indexes
CREATE INDEX idx_proposals_organization_id ON proposals(organization_id);
CREATE INDEX idx_proposals_lead_id ON proposals(lead_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_share_token ON proposals(share_token);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_proposals_updated_at_trigger
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposals_updated_at();