/*
  # Support Tickets System

  1. New Tables
    - `support_tickets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `organization_id` (uuid, references organizations)
      - `requester_id` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users, nullable)
      - `priority` (text) - low, medium, high, urgent
      - `status` (text) - open, in_review, waiting_on_client, in_progress, resolved, closed
      - `category` (text) - bug, feature_request, dashboard_change, mobile_app_request, integration_issue, billing_issue, general_support
      - `attachments` (jsonb) - array of file references
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `closed_at` (timestamptz)

    - `ticket_comments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, references support_tickets)
      - `author_id` (uuid, references auth.users)
      - `content` (text)
      - `is_internal` (boolean) - internal notes vs client-visible
      - `attachments` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Internal staff can view/manage all tickets
    - Clients can view/manage their organization's tickets
    - Only internal staff can create internal comments

  3. Indexes
    - Index on organization_id for filtering
    - Index on status for queries
    - Index on priority for sorting
    - Index on assigned_to for team management
    - Index on ticket_id for comments
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;

-- Create support_tickets table
CREATE TABLE support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  requester_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'waiting_on_client', 'in_progress', 'resolved', 'closed')),
  category text DEFAULT 'general_support' CHECK (category IN ('bug', 'feature_request', 'dashboard_change', 'mobile_app_request', 'integration_issue', 'billing_issue', 'general_support')),
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz,
  closed_at timestamptz
);

-- Create ticket_comments table
CREATE TABLE ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Support Tickets Policies

-- Policy: Internal staff can view all tickets
CREATE POLICY "Internal staff can view all tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Clients can view their organization's tickets
CREATE POLICY "Clients can view org tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'client_member')
    )
  );

-- Policy: Authenticated users can create tickets for their organizations
CREATE POLICY "Users can create tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Internal staff can update all tickets
CREATE POLICY "Internal staff can update all tickets"
  ON support_tickets
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

-- Policy: Clients can update their organization's tickets (limited fields)
CREATE POLICY "Clients can update org tickets"
  ON support_tickets
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'client_member')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('client_admin', 'client_member')
    )
  );

-- Policy: Internal staff can delete tickets
CREATE POLICY "Internal staff can delete tickets"
  ON support_tickets
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Ticket Comments Policies

-- Policy: Internal staff can view all comments
CREATE POLICY "Internal staff can view all comments"
  ON ticket_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Policy: Clients can view non-internal comments on their tickets
CREATE POLICY "Clients can view public comments"
  ON ticket_comments
  FOR SELECT
  TO authenticated
  USING (
    NOT is_internal
    AND ticket_id IN (
      SELECT id FROM support_tickets
      WHERE organization_id IN (
        SELECT organization_id FROM organization_memberships
        WHERE user_id = auth.uid()
        AND role IN ('client_admin', 'client_member')
      )
    )
  );

-- Policy: Authenticated users can create comments on their tickets
CREATE POLICY "Users can create comments"
  ON ticket_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets
      WHERE organization_id IN (
        SELECT organization_id FROM organization_memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Internal staff can update all comments
CREATE POLICY "Internal staff can update all comments"
  ON ticket_comments
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

-- Policy: Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON ticket_comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Policy: Internal staff can delete comments
CREATE POLICY "Internal staff can delete comments"
  ON ticket_comments
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
CREATE INDEX idx_support_tickets_organization_id ON support_tickets(organization_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON ticket_comments(created_at ASC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  END IF;
  
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    NEW.closed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_support_tickets_updated_at_trigger
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_tickets_updated_at();

-- Function to update ticket_comments updated_at
CREATE OR REPLACE FUNCTION update_ticket_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments
CREATE TRIGGER update_ticket_comments_updated_at_trigger
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_comments_updated_at();
