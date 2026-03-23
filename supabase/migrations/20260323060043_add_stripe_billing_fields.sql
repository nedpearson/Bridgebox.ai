/*
  # Add Stripe Billing Fields

  1. Purpose
    - Add Stripe-related fields to organizations
    - Prepare for customer and subscription sync

  2. Changes
    - Add stripe_customer_id to organizations
    - Add subscription tracking fields
    - Add billing plan and status fields
    - Create unique constraints

  3. Security
    - No RLS changes, uses existing organization policies
*/

-- Add Stripe fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS billing_plan text DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status text,
ADD COLUMN IF NOT EXISTS billing_email text,
ADD COLUMN IF NOT EXISTS subscription_current_period_start timestamptz,
ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz,
ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_enterprise_client boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_synced_at timestamptz;

-- Add unique constraint to stripe_customer_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'organizations_stripe_customer_id_key'
  ) THEN
    ALTER TABLE organizations ADD CONSTRAINT organizations_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;
END $$;

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_subscription ON organizations(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;