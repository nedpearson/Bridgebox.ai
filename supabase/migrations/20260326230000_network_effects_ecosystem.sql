-- Phase 7: Network Effects, Data Moat, & Marketplace

-- 1. Extend Templates for the Marketplace
CREATE TABLE bb_marketplace_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES bb_templates(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE, -- the org that published it
  category TEXT NOT NULL CHECK (category IN ('industry_pack', 'business_model', 'workflow', 'ai_agent', 'integration', 'mobile_app', 'premium_addon')),
  best_use_case TEXT,
  version TEXT DEFAULT '1.0.0',
  is_premium BOOLEAN DEFAULT false,
  price_amount DECIMAL(10,2) DEFAULT 0.00,
  pricing_model TEXT DEFAULT 'free' CHECK (pricing_model IN ('free', 'one_time', 'subscription')),
  install_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  features JSONB DEFAULT '[]'::jsonb, -- e.g., ['CRM', 'Invoicing', 'Client Portal']
  compatibility_flags JSONB DEFAULT '{"mobile": false, "ai": false}'::jsonb,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_marketplace_templates_category ON bb_marketplace_templates(category);
CREATE INDEX idx_marketplace_templates_developer ON bb_marketplace_templates(developer_id);
CREATE INDEX idx_marketplace_templates_premium ON bb_marketplace_templates(is_premium);

ALTER TABLE bb_marketplace_templates ENABLE ROW LEVEL SECURITY;

-- Anyone can browse the marketplace inventory
CREATE POLICY "Marketplace is globally readable"
  ON bb_marketplace_templates FOR SELECT
  USING (is_published = true);

-- Only developers (usually Super Admins right now) can publish
CREATE POLICY "Developers can manage their marketplace templates"
  ON bb_marketplace_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_marketplace_templates.developer_id
    )
  );

-- 2. Template Reviews
CREATE TABLE bb_template_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marketplace_template_id UUID NOT NULL REFERENCES bb_marketplace_templates(id) ON DELETE CASCADE,
  reviewer_org_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  performance_impact_score INTEGER, -- 1-100 score indicating efficiency gain
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(marketplace_template_id, reviewer_org_id)
);

CREATE INDEX idx_template_reviews_template ON bb_template_reviews(marketplace_template_id);

ALTER TABLE bb_template_reviews ENABLE ROW LEVEL SECURITY;

-- Reviews are globally readable
CREATE POLICY "Reviews are globally readable"
  ON bb_template_reviews FOR SELECT
  USING (true);

-- Tenants can create/update their own reviews
CREATE POLICY "Tenants can manage their reviews"
  ON bb_template_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_template_reviews.reviewer_org_id
    )
  );

-- 3. Anonymized Industry Benchmarks (The Data Moat)
-- This table is fully disconnected from Tenant UUIDs to prevent PII/PHI leakage.
CREATE TABLE bb_industry_benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  industry TEXT NOT NULL, -- e.g. 'legal', 'accounting', 'agency'
  metric_name TEXT NOT NULL, -- e.g. 'lead_conversion_rate', 'avg_project_duration_days', 'automation_efficiency'
  p50_value DECIMAL(10,2) NOT NULL, -- Median
  p90_value DECIMAL(10,2) NOT NULL, -- Top 10%
  sample_size INTEGER NOT NULL, -- Number of orgs aggregated
  calculation_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(industry, metric_name, calculation_date)
);

CREATE INDEX idx_industry_benchmarks_lookup ON bb_industry_benchmarks(industry, metric_name);

ALTER TABLE bb_industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- Tenants can only SELECT benchmarks for their specific industry
CREATE POLICY "Tenants read their own industry benchmarks"
  ON bb_industry_benchmarks FOR SELECT
  USING (
    industry = (
      SELECT industry FROM bb_organizations
      JOIN bb_users ON bb_users.organization_id = bb_organizations.id
      WHERE bb_users.user_id = auth.uid()
      LIMIT 1
    )
    OR industry = 'global'
  );

-- Super Admins only for insert/update (populated by Cron)
CREATE POLICY "Super Admins manage benchmarks"
  ON bb_industry_benchmarks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- 4. Tenant Purchases (One-Time Premium Addons)
CREATE TABLE bb_tenant_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES bb_organizations(id) ON DELETE CASCADE,
  marketplace_template_id UUID NOT NULL REFERENCES bb_marketplace_templates(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tenant_purchases_org ON bb_tenant_purchases(organization_id);

ALTER TABLE bb_tenant_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view their own purchases"
  ON bb_tenant_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bb_users 
      WHERE user_id = auth.uid() 
      AND organization_id = bb_tenant_purchases.organization_id
    )
  );
