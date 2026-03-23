/*
  # Market Signal Ingestion Engine

  1. New Tables
    - `market_signals`
      - Stores individual market signals from various sources
      - Tracks signal type, strength, confidence, and metadata
      - Links to industries and service categories

    - `market_signal_scores`
      - Aggregated opportunity scores by industry/service
      - Tracks momentum, confidence, and growth direction
      - Historical scoring for trend analysis

    - `market_opportunities`
      - Identified opportunities based on signal aggregation
      - Priority ranking and recommendation data
      - Action tracking and follow-up

  2. Security
    - Enable RLS on all tables
    - Admin/analyst access for signal ingestion
    - Read access for internal team members
*/

-- Create enum for signal types
DO $$ BEGIN
  CREATE TYPE signal_category AS ENUM (
    'industry_demand',
    'service_demand',
    'search_trend',
    'business_activity',
    'internal_crossover',
    'opportunity_flag'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for growth direction
DO $$ BEGIN
  CREATE TYPE growth_direction AS ENUM (
    'rising',
    'stable',
    'declining',
    'emerging',
    'volatile'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for signal source
DO $$ BEGIN
  CREATE TYPE signal_source AS ENUM (
    'search_trends',
    'industry_reports',
    'internal_data',
    'market_research',
    'competitor_analysis',
    'customer_feedback',
    'business_intelligence',
    'manual_entry'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Market signals table
CREATE TABLE IF NOT EXISTS market_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Signal identification
  source signal_source NOT NULL,
  category signal_category NOT NULL,
  signal_name text NOT NULL,
  description text,

  -- Classification
  industry text,
  service_type text,
  geography text,

  -- Metrics
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100) DEFAULT 50,
  strength_score integer CHECK (strength_score >= 0 AND strength_score <= 100) DEFAULT 50,
  growth_direction growth_direction DEFAULT 'stable',
  velocity numeric DEFAULT 0,

  -- Data
  raw_metadata jsonb DEFAULT '{}'::jsonb,
  data_points jsonb DEFAULT '[]'::jsonb,

  -- Timestamps
  signal_date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Market signal scores (aggregated)
CREATE TABLE IF NOT EXISTS market_signal_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Scope
  industry text NOT NULL,
  service_type text,
  geography text,

  -- Aggregated scores
  opportunity_score integer CHECK (opportunity_score >= 0 AND opportunity_score <= 100) DEFAULT 50,
  momentum_score integer CHECK (momentum_score >= 0 AND momentum_score <= 100) DEFAULT 50,
  confidence_level integer CHECK (confidence_level >= 0 AND confidence_level <= 100) DEFAULT 50,

  -- Analysis
  growth_direction growth_direction DEFAULT 'stable',
  signal_count integer DEFAULT 0,
  avg_strength numeric DEFAULT 0,

  -- Insights
  key_signals jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,

  -- Timestamps
  score_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(organization_id, industry, service_type, geography, score_date)
);

-- Market opportunities
CREATE TABLE IF NOT EXISTS market_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Opportunity details
  title text NOT NULL,
  description text,
  category signal_category NOT NULL,

  -- Classification
  industry text NOT NULL,
  service_type text,
  geography text,

  -- Priority
  priority_score integer CHECK (priority_score >= 0 AND priority_score <= 100) DEFAULT 50,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100) DEFAULT 50,
  estimated_value numeric,

  -- Status
  status text DEFAULT 'identified' CHECK (status IN ('identified', 'investigating', 'pursuing', 'won', 'lost', 'archived')),

  -- Tracking
  signal_ids uuid[] DEFAULT ARRAY[]::uuid[],
  supporting_data jsonb DEFAULT '{}'::jsonb,
  action_items jsonb DEFAULT '[]'::jsonb,

  -- Dates
  identified_at timestamptz DEFAULT now(),
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_signals_org ON market_signals(organization_id);
CREATE INDEX IF NOT EXISTS idx_market_signals_category ON market_signals(category);
CREATE INDEX IF NOT EXISTS idx_market_signals_industry ON market_signals(industry);
CREATE INDEX IF NOT EXISTS idx_market_signals_date ON market_signals(signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_signals_confidence ON market_signals(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_market_scores_org ON market_signal_scores(organization_id);
CREATE INDEX IF NOT EXISTS idx_market_scores_industry ON market_signal_scores(industry);
CREATE INDEX IF NOT EXISTS idx_market_scores_date ON market_signal_scores(score_date DESC);
CREATE INDEX IF NOT EXISTS idx_market_scores_opportunity ON market_signal_scores(opportunity_score DESC);

CREATE INDEX IF NOT EXISTS idx_market_opportunities_org ON market_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_status ON market_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_priority ON market_opportunities(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_industry ON market_opportunities(industry);

-- Enable Row Level Security
ALTER TABLE market_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_signal_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for market_signals
CREATE POLICY "Users can view market signals in their organization"
  ON market_signals FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can insert market signals"
  ON market_signals FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Admins can update market signals"
  ON market_signals FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

CREATE POLICY "Admins can delete market signals"
  ON market_signals FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

-- RLS Policies for market_signal_scores
CREATE POLICY "Users can view signal scores in their organization"
  ON market_signal_scores FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage signal scores"
  ON market_signal_scores FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

-- RLS Policies for market_opportunities
CREATE POLICY "Users can view opportunities in their organization"
  ON market_opportunities FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can insert opportunities"
  ON market_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update opportunities"
  ON market_opportunities FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete opportunities"
  ON market_opportunities FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_market_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_market_signals_updated_at ON market_signals;
CREATE TRIGGER update_market_signals_updated_at
  BEFORE UPDATE ON market_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_market_updated_at();

DROP TRIGGER IF EXISTS update_market_signal_scores_updated_at ON market_signal_scores;
CREATE TRIGGER update_market_signal_scores_updated_at
  BEFORE UPDATE ON market_signal_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_market_updated_at();

DROP TRIGGER IF EXISTS update_market_opportunities_updated_at ON market_opportunities;
CREATE TRIGGER update_market_opportunities_updated_at
  BEFORE UPDATE ON market_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_market_updated_at();
