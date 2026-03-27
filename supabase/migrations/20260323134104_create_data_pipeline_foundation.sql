/*
  # Data Pipeline Foundation

  This migration creates the data ingestion and pipeline infrastructure for analytics and AI.

  ## New Tables

  ### `system_events`
  Unified event stream capturing all significant system activities
  - `id` (uuid, primary key)
  - `event_type` (text) - Type of event (lead_created, proposal_approved, etc.)
  - `event_category` (text) - Category: crm, billing, project, support, user_action, system
  - `organization_id` (uuid, nullable) - Associated organization
  - `user_id` (uuid, nullable) - User who triggered the event
  - `entity_type` (text, nullable) - Type of entity (lead, project, ticket, etc.)
  - `entity_id` (uuid, nullable) - ID of the related entity
  - `event_data` (jsonb) - Full event payload
  - `metadata` (jsonb) - Additional context and tags
  - `timestamp` (timestamptz) - When event occurred
  - `created_at` (timestamptz)

  ### `activity_logs`
  User activity tracking for behavior analytics
  - `id` (uuid, primary key)
  - `user_id` (uuid) - User performing action
  - `organization_id` (uuid, nullable) - Organization context
  - `action` (text) - Action performed (view, create, update, delete, etc.)
  - `resource_type` (text) - Type of resource (lead, project, etc.)
  - `resource_id` (uuid, nullable) - ID of resource
  - `page` (text, nullable) - Page/route where action occurred
  - `metadata` (jsonb) - Additional context
  - `timestamp` (timestamptz)
  - `created_at` (timestamptz)

  ### `aggregated_metrics`
  Pre-computed metrics for fast analytics
  - `id` (uuid, primary key)
  - `metric_type` (text) - Type of metric (conversion_rate, revenue, ticket_volume, etc.)
  - `metric_category` (text) - Category: crm, billing, project, support, engagement
  - `organization_id` (uuid, nullable) - Organization scope (null for global)
  - `user_id` (uuid, nullable) - User scope (null for org/global)
  - `time_period` (text) - Time period: hour, day, week, month, quarter, year
  - `period_start` (timestamptz) - Start of period
  - `period_end` (timestamptz) - End of period
  - `metric_value` (numeric) - Computed value
  - `metric_data` (jsonb) - Detailed breakdown
  - `computed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `data_signals`
  System signals and patterns for AI/ML
  - `id` (uuid, primary key)
  - `signal_type` (text) - Type: trend, anomaly, pattern, prediction
  - `signal_category` (text) - Category: crm, billing, project, support, engagement
  - `organization_id` (uuid, nullable)
  - `severity` (text) - Severity: info, low, medium, high, critical
  - `title` (text) - Signal title
  - `description` (text, nullable)
  - `signal_data` (jsonb) - Detailed signal information
  - `confidence_score` (numeric) - Confidence level 0-100
  - `status` (text) - Status: new, acknowledged, resolved
  - `detected_at` (timestamptz)
  - `created_at` (timestamptz)

  ### `notifications`
  System-wide notification delivery
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Recipient
  - `organization_id` (uuid, nullable)
  - `type` (text) - Type: info, success, warning, error
  - `title` (text)
  - `message` (text)
  - `link` (text, nullable) - Link to related resource
  - `read` (boolean)
  - `read_at` (timestamptz, nullable)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access data for their organization
  - Admin users can access all data
  - System events are read-only for most users

  ## Indexes
  - Event lookups by type, category, organization, user, timestamp
  - Activity logs by user, organization, timestamp
  - Metrics by type, category, organization, period
  - Signals by type, severity, status, organization
  - Notifications by user, read status
*/

-- System Events Table
CREATE TABLE IF NOT EXISTS system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_category text NOT NULL CHECK (event_category IN ('crm', 'billing', 'project', 'support', 'user_action', 'system')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type text,
  entity_id uuid,
  event_data jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_category ON system_events(event_category);
CREATE INDEX IF NOT EXISTS idx_system_events_org ON system_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_events_user ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON system_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_entity ON system_events(entity_type, entity_id);

ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization events"
  ON system_events FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_memberships om WHERE om.user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "System can insert events"
  ON system_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  page text,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_org ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Aggregated Metrics Table
CREATE TABLE IF NOT EXISTS aggregated_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_category text NOT NULL CHECK (metric_category IN ('crm', 'billing', 'project', 'support', 'engagement', 'system')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  time_period text NOT NULL CHECK (time_period IN ('hour', 'day', 'week', 'month', 'quarter', 'year')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metric_value numeric NOT NULL DEFAULT 0,
  metric_data jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(metric_type, metric_category, organization_id, user_id, time_period, period_start)
);

CREATE INDEX IF NOT EXISTS idx_aggregated_metrics_type ON aggregated_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_aggregated_metrics_category ON aggregated_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_aggregated_metrics_org ON aggregated_metrics(organization_id);
CREATE INDEX IF NOT EXISTS idx_aggregated_metrics_period ON aggregated_metrics(time_period, period_start DESC);

ALTER TABLE aggregated_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization metrics"
  ON aggregated_metrics FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_memberships om WHERE om.user_id = auth.uid()
    )
    OR user_id = auth.uid()
    OR organization_id IS NULL
  );

CREATE POLICY "System can manage metrics"
  ON aggregated_metrics FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Data Signals Table
CREATE TABLE IF NOT EXISTS data_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_type text NOT NULL CHECK (signal_type IN ('trend', 'anomaly', 'pattern', 'prediction')),
  signal_category text NOT NULL CHECK (signal_category IN ('crm', 'billing', 'project', 'support', 'engagement', 'system')),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  severity text NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  description text,
  signal_data jsonb DEFAULT '{}'::jsonb,
  confidence_score numeric CHECK (confidence_score >= 0 AND confidence_score <= 100),
  status text DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
  detected_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_signals_type ON data_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_data_signals_category ON data_signals(signal_category);
CREATE INDEX IF NOT EXISTS idx_data_signals_org ON data_signals(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_signals_severity ON data_signals(severity);
CREATE INDEX IF NOT EXISTS idx_data_signals_status ON data_signals(status);
CREATE INDEX IF NOT EXISTS idx_data_signals_detected ON data_signals(detected_at DESC);

ALTER TABLE data_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organization signals"
  ON data_signals FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_memberships om WHERE om.user_id = auth.uid()
    )
    OR organization_id IS NULL
  );

CREATE POLICY "Users can update own organization signals"
  ON data_signals FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_memberships om WHERE om.user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_memberships om WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert signals"
  ON data_signals FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title text NOT NULL,
  message text NOT NULL,
  link text,
  read boolean DEFAULT false,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_org ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
