/*
  # Team Invitations System

  1. New Tables
    - `invitations`
      - `id` (uuid, primary key)
      - `email` (text)
      - `organization_id` (uuid, references organizations)
      - `role` (user_role enum)
      - `status` (text) - pending, accepted, expired, revoked
      - `invited_by` (uuid, references auth.users)
      - `token` (text, unique) - secure invitation token
      - `expires_at` (timestamptz)
      - `accepted_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on invitations table
    - Organization admins can manage invitations for their org
    - Internal staff can manage all invitations
    - Users can view invitations sent to their email

  3. Indexes
    - Index on email for fast lookups
    - Index on token for acceptance flow
    - Index on organization_id for org-level queries
    - Index on status for filtering
*/

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'client_member' NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days') NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Policy: Organization admins can view their org's invitations
CREATE POLICY "Org admins can view org invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'super_admin')
    )
  );

-- Policy: Internal staff can view all invitations
CREATE POLICY "Internal staff can view all invitations"
  ON invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Organization admins can create invitations for their org
CREATE POLICY "Org admins can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'super_admin')
    )
  );

-- Policy: Internal staff can create any invitations
CREATE POLICY "Internal staff can create invitations"
  ON invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Organization admins can update their org's invitations
CREATE POLICY "Org admins can update org invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'super_admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'super_admin')
    )
  );

-- Policy: Internal staff can update all invitations
CREATE POLICY "Internal staff can update all invitations"
  ON invitations
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

-- Policy: Users can update invitations sent to them (for acceptance)
CREATE POLICY "Users can accept own invitations"
  ON invitations
  FOR UPDATE
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status IN ('accepted', 'pending')
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_organization_id ON invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON invitations(expires_at) WHERE status = 'pending';

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE invitations
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'pending'
    AND expires_at < now();
END;
$$;