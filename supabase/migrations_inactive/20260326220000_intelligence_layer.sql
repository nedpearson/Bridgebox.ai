-- 1. Intelligence Events Table
CREATE TABLE bb_intelligence_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  module TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intelligence_events_org ON bb_intelligence_events(organization_id);
CREATE INDEX idx_intelligence_events_type ON bb_intelligence_events(event_type);
CREATE INDEX idx_intelligence_events_module ON bb_intelligence_events(module);

ALTER TABLE bb_intelligence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert telemetry for their org"
  ON bb_intelligence_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_intelligence_events.organization_id
    )
  );

CREATE POLICY "Super and Tenant admins can view intelligence events"
  ON bb_intelligence_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_intelligence_events.organization_id
      AND role IN ('super_admin', 'tenant_admin')
    )
  );

-- 2. Tenant Insights Table
CREATE TABLE bb_tenant_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact_score INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'ignored')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenant_insights_org ON bb_tenant_insights(organization_id);
CREATE INDEX idx_tenant_insights_status ON bb_tenant_insights(status);

ALTER TABLE bb_tenant_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Admins can manage insights"
  ON bb_tenant_insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_tenant_insights.organization_id
      AND role IN ('super_admin', 'tenant_admin')
    )
  );

-- 3. Tenant Recommendations Table
CREATE TABLE bb_tenant_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES bb_tenant_insights(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  action_payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  acted_at TIMESTAMPTZ
);

CREATE INDEX idx_tenant_recommendations_org ON bb_tenant_recommendations(organization_id);

ALTER TABLE bb_tenant_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant Admins can manage recommendations"
  ON bb_tenant_recommendations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_tenant_recommendations.organization_id
      AND role IN ('super_admin', 'tenant_admin')
    )
  );

-- Auto-update timestamps triggers
CREATE OR REPLACE FUNCTION update_insight_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_insights_timestamp
  BEFORE UPDATE ON bb_tenant_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_insight_timestamp();
