/*
  # External Data Connector Framework

  1. New Tables
    - `connectors`
      - Core connector configurations
      - Tracks connection status, auth, and sync state
      - Organization-scoped for security

    - `connector_providers`
      - Registry of available integration providers
      - Metadata about capabilities and features

    - `connector_sync_logs`
      - Historical record of all sync operations
      - Performance metrics and error tracking

    - `connector_events`
      - Audit trail of connector activities
      - Webhook triggers and notifications

    - `connector_data_mappings`
      - Field mapping configurations
      - Transform rules for data normalization

  2. Security
    - RLS enabled on all tables
    - Connector data restricted to organization members
    - Audit trail for all connector operations
    - Credentials never stored in database (env/backend only)

  3. Performance
    - Indexes on foreign keys and status fields
    - Optimized for sync log queries
    - Efficient event tracking
*/

-- Connector providers registry (global, no RLS needed)
CREATE TABLE IF NOT EXISTS connector_providers (
  id text PRIMARY KEY,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  connector_type text NOT NULL,
  category text NOT NULL,
  logo_url text,
  website_url text,
  documentation_url text,
  auth_type text NOT NULL DEFAULT 'api_key',
  required_scopes text[],
  features text[] DEFAULT '{}',
  is_popular boolean DEFAULT false,
  is_enterprise boolean DEFAULT false,
  status text DEFAULT 'available',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Organization connectors
CREATE TABLE IF NOT EXISTS connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id text NOT NULL REFERENCES connector_providers(id),
  provider_name text NOT NULL,
  connector_type text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'not_connected',

  -- Auth information (no secrets stored here)
  auth_type text NOT NULL,
  is_authenticated boolean DEFAULT false,
  auth_expires_at timestamptz,
  auth_scopes text[],

  -- Configuration
  config jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',

  -- Sync tracking
  last_sync_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  next_sync_at timestamptz,
  sync_count integer DEFAULT 0,
  record_count integer DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Connector sync logs
CREATE TABLE IF NOT EXISTS connector_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  status text NOT NULL,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  duration_ms integer,

  records_processed integer DEFAULT 0,
  records_created integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_skipped integer DEFAULT 0,
  records_failed integer DEFAULT 0,

  error_message text,
  error_details jsonb,

  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Connector events (audit trail)
CREATE TABLE IF NOT EXISTS connector_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  event_type text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info',
  data jsonb,

  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Connector data mappings
CREATE TABLE IF NOT EXISTS connector_data_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_id uuid NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  source_field text NOT NULL,
  target_field text NOT NULL,
  target_table text,
  transform_function text,
  is_required boolean DEFAULT false,
  default_value text,

  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_connectors_org ON connectors(organization_id);
CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
CREATE INDEX IF NOT EXISTS idx_connectors_provider ON connectors(provider_id);
CREATE INDEX IF NOT EXISTS idx_connectors_type ON connectors(connector_type);
CREATE INDEX IF NOT EXISTS idx_connectors_next_sync ON connectors(next_sync_at) WHERE status = 'connected';

CREATE INDEX IF NOT EXISTS idx_sync_logs_connector ON connector_sync_logs(connector_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_org ON connector_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started ON connector_sync_logs(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_connector_events_connector ON connector_events(connector_id);
CREATE INDEX IF NOT EXISTS idx_connector_events_org ON connector_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_connector_events_created ON connector_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_mappings_connector ON connector_data_mappings(connector_id);
CREATE INDEX IF NOT EXISTS idx_data_mappings_org ON connector_data_mappings(organization_id);

-- Enable RLS
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_data_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connectors
CREATE POLICY "Users can view connectors in their organization"
  ON connectors FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create connectors"
  ON connectors FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Admins can update connectors"
  ON connectors FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Admins can delete connectors"
  ON connectors FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

-- RLS Policies for sync logs
CREATE POLICY "Users can view sync logs in their organization"
  ON connector_sync_logs FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create sync logs"
  ON connector_sync_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for events
CREATE POLICY "Users can view events in their organization"
  ON connector_events FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create events"
  ON connector_events FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for data mappings
CREATE POLICY "Users can view mappings in their organization"
  ON connector_data_mappings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage mappings"
  ON connector_data_mappings FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

-- Seed connector providers
INSERT INTO connector_providers (id, name, display_name, description, connector_type, category, auth_type, features, is_popular, status) VALUES
  ('salesforce', 'salesforce', 'Salesforce', 'Connect to Salesforce CRM for lead and opportunity data', 'crm', 'business_systems', 'oauth2', ARRAY['contacts', 'leads', 'opportunities', 'accounts'], true, 'available'),
  ('hubspot', 'hubspot', 'HubSpot', 'Sync contacts, deals, and marketing data from HubSpot', 'crm', 'business_systems', 'oauth2', ARRAY['contacts', 'deals', 'companies', 'marketing'], true, 'available'),
  ('pipedrive', 'pipedrive', 'Pipedrive', 'Import deals and contacts from Pipedrive CRM', 'crm', 'business_systems', 'api_key', ARRAY['deals', 'contacts', 'organizations'], true, 'available'),
  ('quickbooks', 'quickbooks', 'QuickBooks', 'Sync invoices, expenses, and financial data', 'accounting', 'business_systems', 'oauth2', ARRAY['invoices', 'expenses', 'customers', 'vendors'], true, 'available'),
  ('xero', 'xero', 'Xero', 'Connect to Xero accounting for financial data', 'accounting', 'business_systems', 'oauth2', ARRAY['invoices', 'bills', 'contacts', 'reports'], true, 'available'),
  ('google_sheets', 'google_sheets', 'Google Sheets', 'Import data from Google Sheets', 'spreadsheet', 'business_systems', 'oauth2', ARRAY['read', 'write'], true, 'available'),
  ('airtable', 'airtable', 'Airtable', 'Sync records from Airtable bases', 'database', 'business_systems', 'api_key', ARRAY['bases', 'records', 'attachments'], true, 'available'),
  ('zendesk', 'zendesk', 'Zendesk', 'Import support tickets and customer data', 'helpdesk', 'business_systems', 'oauth2', ARRAY['tickets', 'users', 'organizations'], true, 'available'),
  ('stripe', 'stripe', 'Stripe', 'Sync payments, subscriptions, and customer data', 'payment', 'commerce_financial', 'api_key', ARRAY['payments', 'subscriptions', 'customers', 'invoices'], true, 'available'),
  ('paypal', 'paypal', 'PayPal', 'Connect PayPal for payment data', 'payment', 'commerce_financial', 'oauth2', ARRAY['transactions', 'invoices'], true, 'available'),
  ('square', 'square', 'Square', 'Sync Square payment and invoice data', 'payment', 'commerce_financial', 'oauth2', ARRAY['payments', 'invoices', 'customers'], true, 'available'),
  ('gmail', 'gmail', 'Gmail', 'Connect Gmail for email data', 'email', 'communication', 'oauth2', ARRAY['messages', 'threads', 'labels'], true, 'available'),
  ('outlook', 'outlook', 'Outlook', 'Sync Outlook email and calendar', 'email', 'communication', 'oauth2', ARRAY['mail', 'calendar', 'contacts'], true, 'available'),
  ('google_calendar', 'google_calendar', 'Google Calendar', 'Import calendar events and meetings', 'calendar', 'communication', 'oauth2', ARRAY['events', 'calendars'], true, 'available'),
  ('slack', 'slack', 'Slack', 'Connect Slack for messaging data', 'messaging', 'communication', 'oauth2', ARRAY['messages', 'channels', 'users'], true, 'available'),
  ('google_trends', 'google_trends', 'Google Trends', 'Access search trend data', 'trend_source', 'market_data', 'api_key', ARRAY['trends', 'keywords', 'regions'], false, 'available'),
  ('census_data', 'census_data', 'US Census Data', 'Access demographic and economic data', 'public_dataset', 'market_data', 'api_key', ARRAY['demographics', 'economics', 'business'], false, 'available'),
  ('industry_reports', 'industry_reports', 'Industry Reports', 'Import industry trend reports', 'industry_signal', 'market_data', 'none', ARRAY['reports', 'insights'], false, 'beta')
ON CONFLICT (id) DO NOTHING;