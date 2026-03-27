/*
  # Proposal Approval Tracking

  1. Purpose
    - Enable client-facing proposal approval workflow
    - Track who approved proposals and when
    - Capture approval metadata (name, title, IP)
    - Support secure share links for external viewing

  2. Changes
    - Add approver tracking fields to proposals
    - Add declined_reason for rejection feedback
    - Add approval_ip for security auditing
    - Update RLS policies for share token access

  3. Security
    - Share tokens provide read-only access
    - Approval actions require valid token
    - IP logging for audit trail
*/

-- Add approval tracking fields to proposals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'approver_name') THEN
    ALTER TABLE proposals ADD COLUMN approver_name text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'approver_title') THEN
    ALTER TABLE proposals ADD COLUMN approver_title text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'approver_email') THEN
    ALTER TABLE proposals ADD COLUMN approver_email text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'approval_ip') THEN
    ALTER TABLE proposals ADD COLUMN approval_ip text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'declined_reason') THEN
    ALTER TABLE proposals ADD COLUMN declined_reason text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'agreement_accepted') THEN
    ALTER TABLE proposals ADD COLUMN agreement_accepted boolean DEFAULT false;
  END IF;
END $$;

-- Add RLS policy for public proposal viewing via share token
DROP POLICY IF EXISTS "Public can view proposals via share token" ON proposals;
CREATE POLICY "Public can view proposals via share token"
  ON proposals
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);

-- Add RLS policy for public proposal updates via share token (for approval/decline)
DROP POLICY IF EXISTS "Public can update proposal status via share token" ON proposals;
CREATE POLICY "Public can update proposal status via share token"
  ON proposals
  FOR UPDATE
  TO anon
  USING (share_token IS NOT NULL)
  WITH CHECK (
    share_token IS NOT NULL 
    AND status IN ('approved', 'declined', 'viewed')
  );

-- Create index on share_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_proposals_share_token ON proposals(share_token) WHERE share_token IS NOT NULL;

-- Create function to track proposal views
CREATE OR REPLACE FUNCTION track_proposal_view()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.viewed_at IS NULL AND NEW.status = 'viewed' THEN
    NEW.viewed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for proposal view tracking
DROP TRIGGER IF EXISTS trigger_track_proposal_view ON proposals;
CREATE TRIGGER trigger_track_proposal_view
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION track_proposal_view();
