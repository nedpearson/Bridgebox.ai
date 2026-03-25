/*
  # Integration Architecture & External Domain Objects

  1. New Tables
    - integration_accounts: Provider configurations and defaults per organization.
    - integration_connections: Individual connection links (auth, cursors) for a provider.
    - integration_sync_jobs: Tracking of sync operations per connection.
    - integration_webhook_events: Raw payload capture for incoming webhooks.
    - external_contacts
    - external_matters
    - external_events
    - external_messages
    - external_documents
    - external_expenses
    - external_compliance_records
    - external_tasks
    - external_object_links (polymorphic links between Bridgebox internal objects and external objects)

  2. Security
    - All tables scoped by `organization_id`
    - RLS enabled on all tables
    - Full organization isolation

  3. Features
    - Audit columns (created_at, updated_at)
    - Dedupe keys (external_id mixed with provider_name)
*/

-- 1. Integration Accounts
CREATE TABLE IF NOT EXISTS integration_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_name text NOT NULL, -- 'clio', 'financial_cents', etc.
  is_active boolean DEFAULT false,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name)
);
ALTER TABLE integration_accounts ENABLE ROW LEVEL SECURITY;

-- 2. Integration Connections
CREATE TABLE IF NOT EXISTS integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_account_id uuid NOT NULL REFERENCES integration_accounts(id) ON DELETE CASCADE,
  external_account_id text, -- ID of the user/account on the remote system
  auth_state jsonb DEFAULT '{}', -- Tokens, refresh tokens, scopes
  status text DEFAULT 'disconnected', -- connected, disconnected, error
  last_sync_at timestamptz,
  sync_cursors jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;

-- 3. Integration Sync Jobs
CREATE TABLE IF NOT EXISTS integration_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  sync_direction text NOT NULL, -- import, export, bidirectional
  status text NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  started_at timestamptz,
  completed_at timestamptz,
  records_processed integer DEFAULT 0,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;

-- 4. Integration Webhook Events
CREATE TABLE IF NOT EXISTS integration_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE, -- Can be null initially if routing fails
  provider_name text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending', -- pending, processed, failed, ignored
  error_message text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);
ALTER TABLE integration_webhook_events ENABLE ROW LEVEL SECURITY;

-- Shared External Fields Template for the tables below:
-- id uuid PRIMARY KEY
-- organization_id uuid NOT NULL
-- connection_id uuid NOT NULL
-- external_id text NOT NULL
-- provider_name text NOT NULL
-- raw_data jsonb
-- created_at, updated_at
-- UNIQUE(organization_id, provider_name, external_id)

-- 5. External Contacts
CREATE TABLE IF NOT EXISTS external_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  name text,
  email text,
  phone text,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_contacts ENABLE ROW LEVEL SECURITY;

-- 6. External Matters
CREATE TABLE IF NOT EXISTS external_matters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  title text,
  status text,
  description text,
  open_date timestamptz,
  close_date timestamptz,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_matters ENABLE ROW LEVEL SECURITY;

-- 7. External Events
CREATE TABLE IF NOT EXISTS external_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  title text,
  start_time timestamptz,
  end_time timestamptz,
  is_all_day boolean DEFAULT false,
  location text,
  description text,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_events ENABLE ROW LEVEL SECURITY;

-- 8. External Messages
CREATE TABLE IF NOT EXISTS external_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  sender_external_id text,
  recipient_external_id text,
  subject text,
  body text,
  sent_at timestamptz,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_messages ENABLE ROW LEVEL SECURITY;

-- 9. External Documents
CREATE TABLE IF NOT EXISTS external_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  filename text,
  mime_type text,
  size_bytes bigint,
  download_url text,
  document_type text,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_documents ENABLE ROW LEVEL SECURITY;

-- 10. External Expenses
CREATE TABLE IF NOT EXISTS external_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  amount numeric(12,2),
  currency text DEFAULT 'USD',
  expense_date timestamptz,
  category text,
  description text,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_expenses ENABLE ROW LEVEL SECURITY;

-- 11. External Compliance Records
CREATE TABLE IF NOT EXISTS external_compliance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL, -- e.g. soberlink
  record_type text, -- test_result, missed_test, alert
  status text, -- compliant, non_compliant, missed
  recorded_at timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_compliance_records ENABLE ROW LEVEL SECURITY;

-- 12. External Tasks
CREATE TABLE IF NOT EXISTS external_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider_name text NOT NULL,
  title text,
  description text,
  status text,
  due_date timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}',
  raw_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider_name, external_id)
);
ALTER TABLE external_tasks ENABLE ROW LEVEL SECURITY;

-- 13. External Object Links
-- Represents a polymorphic link from an internal entity (like a Project or User) to an external entity record.
CREATE TABLE IF NOT EXISTS external_object_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  internal_object_type text NOT NULL, -- 'project', 'user', 'document', etc.
  internal_object_id uuid NOT NULL,
  external_object_type text NOT NULL, -- 'external_matters', 'external_contacts', etc.
  external_object_id uuid NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(internal_object_type, internal_object_id, external_object_type, external_object_id)
);
ALTER TABLE external_object_links ENABLE ROW LEVEL SECURITY;

-- Enable RLS Policies on all new tables restricting to organization members

-- integration_accounts
CREATE POLICY "integration_accounts_org_isolation" ON integration_accounts
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- integration_connections
CREATE POLICY "integration_connections_org_isolation" ON integration_connections
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- integration_sync_jobs
CREATE POLICY "integration_sync_jobs_org_isolation" ON integration_sync_jobs
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- integration_webhook_events
CREATE POLICY "integration_webhook_events_org_isolation" ON integration_webhook_events
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_contacts
CREATE POLICY "external_contacts_org_isolation" ON external_contacts
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_matters
CREATE POLICY "external_matters_org_isolation" ON external_matters
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_events
CREATE POLICY "external_events_org_isolation" ON external_events
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_messages
CREATE POLICY "external_messages_org_isolation" ON external_messages
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_documents
CREATE POLICY "external_documents_org_isolation" ON external_documents
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_expenses
CREATE POLICY "external_expenses_org_isolation" ON external_expenses
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_compliance_records
CREATE POLICY "external_compliance_records_org_isolation" ON external_compliance_records
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_tasks
CREATE POLICY "external_tasks_org_isolation" ON external_tasks
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- external_object_links
CREATE POLICY "external_object_links_org_isolation" ON external_object_links
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- Define triggers for updated_at 
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_integration_accounts_updated_at BEFORE UPDATE ON integration_accounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_integration_connections_updated_at BEFORE UPDATE ON integration_connections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_integration_sync_jobs_updated_at BEFORE UPDATE ON integration_sync_jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_external_contacts_updated_at BEFORE UPDATE ON external_contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_matters_updated_at BEFORE UPDATE ON external_matters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_events_updated_at BEFORE UPDATE ON external_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_messages_updated_at BEFORE UPDATE ON external_messages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_documents_updated_at BEFORE UPDATE ON external_documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_expenses_updated_at BEFORE UPDATE ON external_expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_compliance_records_updated_at BEFORE UPDATE ON external_compliance_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_external_tasks_updated_at BEFORE UPDATE ON external_tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
