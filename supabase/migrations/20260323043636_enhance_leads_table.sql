/*
  # Enhance Leads Table for Full CRM

  ## Changes
  - Add additional fields for comprehensive lead management
  - Add source tracking for lead attribution
  - Add phone number field
  - Add assigned owner field
  - Add organization reference for converted leads
  - Add notes field
  - Add priority field
  - Update status enum to include pipeline stages
  - Create indexes for performance

  ## New Columns
  - `phone` - Contact phone number
  - `source` - Where the lead came from (website, referral, etc.)
  - `requested_service` - What service they're interested in
  - `message` - Additional message from contact form
  - `assigned_to` - Internal staff member assigned to this lead
  - `organization_id` - Link to organization if converted
  - `notes` - Internal notes about the lead
  - `priority` - Lead priority level
  - `qualified_at` - When lead was qualified
  - `converted_at` - When lead was converted

  ## Security
  RLS policies already exist, updating for new fields
*/

-- Add new columns to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'phone') THEN
    ALTER TABLE leads ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'source') THEN
    ALTER TABLE leads ADD COLUMN source text DEFAULT 'website';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'requested_service') THEN
    ALTER TABLE leads ADD COLUMN requested_service text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'message') THEN
    ALTER TABLE leads ADD COLUMN message text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'assigned_to') THEN
    ALTER TABLE leads ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'organization_id') THEN
    ALTER TABLE leads ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
    ALTER TABLE leads ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'priority') THEN
    ALTER TABLE leads ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'qualified_at') THEN
    ALTER TABLE leads ADD COLUMN qualified_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'converted_at') THEN
    ALTER TABLE leads ADD COLUMN converted_at timestamptz;
  END IF;
END $$;

-- Update status check constraint to include more pipeline stages
DO $$
BEGIN
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'converted', 'lost'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add policies for updating leads (internal staff only)
DROP POLICY IF EXISTS "Internal staff can update leads" ON leads;
CREATE POLICY "Internal staff can update leads"
  ON leads
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

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_requested_service ON leads(requested_service) WHERE requested_service IS NOT NULL;
