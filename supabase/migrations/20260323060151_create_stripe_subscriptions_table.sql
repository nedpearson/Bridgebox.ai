/*
  # Create Stripe Subscriptions Table

  1. Purpose
    - Track Stripe subscription data separately from internal billing
    - Enable webhook-driven sync
    - Store complete subscription lifecycle

  2. Changes
    - Create stripe_subscriptions table for external Stripe data
    - Create stripe_invoices table for invoice history
    - Add RLS policies
    - Add sync triggers

  3. Security
    - Organization members can view
    - Only internal staff can modify
*/

-- Create Stripe subscriptions tracking table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  status text NOT NULL,
  plan text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create Stripe invoices tracking table
CREATE TABLE IF NOT EXISTS stripe_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  status text NOT NULL,
  amount_due integer NOT NULL,
  amount_paid integer NOT NULL,
  currency text DEFAULT 'usd',
  invoice_pdf text,
  hosted_invoice_url text,
  invoice_number text,
  period_start timestamptz,
  period_end timestamptz,
  due_date timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_invoices ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_org_id ON stripe_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer ON stripe_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_stripe_id ON stripe_invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_org_id ON stripe_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_customer_id ON stripe_invoices(stripe_customer_id);

-- RLS: Organization members can view their Stripe subscription
DROP POLICY IF EXISTS "Organization members can view stripe subscription" ON stripe_subscriptions;
CREATE POLICY "Organization members can view stripe subscription"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- RLS: Internal staff can manage Stripe subscriptions
DROP POLICY IF EXISTS "Internal staff can manage stripe subscriptions" ON stripe_subscriptions;
CREATE POLICY "Internal staff can manage stripe subscriptions"
  ON stripe_subscriptions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('super_admin', 'internal_staff')
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('super_admin', 'internal_staff')
      AND o.type = 'internal'
    )
  );

-- RLS: Organization members can view their Stripe invoices
DROP POLICY IF EXISTS "Organization members can view stripe invoices" ON stripe_invoices;
CREATE POLICY "Organization members can view stripe invoices"
  ON stripe_invoices
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- RLS: Internal staff can manage Stripe invoices
DROP POLICY IF EXISTS "Internal staff can manage stripe invoices" ON stripe_invoices;
CREATE POLICY "Internal staff can manage stripe invoices"
  ON stripe_invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('super_admin', 'internal_staff')
      AND o.type = 'internal'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships om
      JOIN organizations o ON o.id = om.organization_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('super_admin', 'internal_staff')
      AND o.type = 'internal'
    )
  );

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_stripe_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscription updates
DROP TRIGGER IF EXISTS trigger_update_stripe_subscription_timestamp ON stripe_subscriptions;
CREATE TRIGGER trigger_update_stripe_subscription_timestamp
  BEFORE UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_subscription_timestamp();

-- Function to sync subscription to organization
CREATE OR REPLACE FUNCTION sync_stripe_subscription_to_organization()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE organizations
  SET
    stripe_subscription_id = NEW.stripe_subscription_id,
    subscription_status = NEW.status,
    billing_plan = NEW.plan,
    subscription_current_period_start = NEW.current_period_start,
    subscription_current_period_end = NEW.current_period_end,
    subscription_cancel_at_period_end = NEW.cancel_at_period_end,
    billing_synced_at = now()
  WHERE id = NEW.organization_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to keep organization in sync with Stripe subscription
DROP TRIGGER IF EXISTS trigger_sync_stripe_subscription_to_org ON stripe_subscriptions;
CREATE TRIGGER trigger_sync_stripe_subscription_to_org
  AFTER INSERT OR UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION sync_stripe_subscription_to_organization();