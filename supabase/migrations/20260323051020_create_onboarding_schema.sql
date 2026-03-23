/*
  # Client Onboarding Schema

  1. New Tables
    - `onboarding_responses`
      - `id` (uuid, primary key)
      - `organization_id` (uuid, references organizations)
      - `user_id` (uuid, references auth.users)
      - `company_name` (text)
      - `company_size` (text)
      - `industry` (text)
      - `website` (text, optional)
      - `primary_contact_name` (text)
      - `primary_contact_email` (text)
      - `services_needed` (text array)
      - `current_systems` (jsonb)
      - `business_goals` (text array)
      - `timeline` (text)
      - `additional_notes` (text)
      - `status` (text) - draft, completed, reviewed
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on onboarding_responses table
    - Users can only view/edit their organization's onboarding
    - Internal staff can view all onboarding responses

  3. Indexes
    - Index on organization_id for fast lookups
    - Index on status for filtering
*/

-- Create onboarding_responses table
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  company_size text,
  industry text,
  website text,
  primary_contact_name text NOT NULL,
  primary_contact_email text NOT NULL,
  services_needed text[] DEFAULT ARRAY[]::text[],
  current_systems jsonb DEFAULT '{}'::jsonb,
  business_goals text[] DEFAULT ARRAY[]::text[],
  timeline text,
  additional_notes text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'reviewed')),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their organization's onboarding
CREATE POLICY "Users can view own organization onboarding"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert onboarding for their organization
CREATE POLICY "Users can create onboarding for own organization"
  ON onboarding_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update their organization's onboarding
CREATE POLICY "Users can update own organization onboarding"
  ON onboarding_responses
  FOR UPDATE
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

-- Policy: Internal staff can view all onboarding
CREATE POLICY "Internal staff can view all onboarding"
  ON onboarding_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Internal staff can update all onboarding
CREATE POLICY "Internal staff can update all onboarding"
  ON onboarding_responses
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_onboarding_organization_id ON onboarding_responses(organization_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON onboarding_responses(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON onboarding_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_completed_at ON onboarding_responses(completed_at) WHERE completed_at IS NOT NULL;

-- Add onboarding_completed field to organizations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'onboarding_completed') THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;

-- Add onboarding_completed_at to organizations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'onboarding_completed_at') THEN
    ALTER TABLE organizations ADD COLUMN onboarding_completed_at timestamptz;
  END IF;
END $$;