/*
  # Opportunity Scoring System

  1. New Tables
    - `scored_opportunities`
      - Stores scored opportunities with all metrics
      - Tracks industry and service opportunities
      - Includes score breakdowns and recommendations
      - Historical tracking of opportunity evolution

  2. Security
    - Enable RLS on all tables
    - Internal staff can view and manage opportunities
    - Read-only access for viewing scores

  3. Indexes
    - Performance indexes on score fields
    - Filters by type, industry, service
*/

-- Create enum for opportunity type
DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('industry', 'service', 'segment', 'hybrid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for opportunity level
DO $$ BEGIN
  CREATE TYPE opportunity_level AS ENUM ('high', 'medium', 'low');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Scored opportunities table
CREATE TABLE IF NOT EXISTS scored_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,

  -- Classification
  type opportunity_type NOT NULL,
  name text NOT NULL,
  description text,
  industry text,
  service_type text,
  client_segment text,

  -- Overall scores
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100) NOT NULL,
  confidence_level integer CHECK (confidence_level >= 0 AND confidence_level <= 100) NOT NULL,
  opportunity_level opportunity_level NOT NULL,

  -- Score breakdown
  demand_momentum integer CHECK (demand_momentum >= 0 AND demand_momentum <= 100) DEFAULT 0,
  revenue_potential integer CHECK (revenue_potential >= 0 AND revenue_potential <= 100) DEFAULT 0,
  implementation_fit integer CHECK (implementation_fit >= 0 AND implementation_fit <= 100) DEFAULT 0,
  capability_fit integer CHECK (capability_fit >= 0 AND capability_fit <= 100) DEFAULT 0,
  demand_frequency integer CHECK (demand_frequency >= 0 AND demand_frequency <= 100) DEFAULT 0,
  market_signal_confidence integer CHECK (market_signal_confidence >= 0 AND market_signal_confidence <= 100) DEFAULT 0,
  strategic_alignment integer CHECK (strategic_alignment >= 0 AND strategic_alignment <= 100) DEFAULT 0,

  -- Supporting data
  reasons jsonb DEFAULT '[]'::jsonb,
  recommended_action text,
  metrics jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_org ON scored_opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_type ON scored_opportunities(type);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_industry ON scored_opportunities(industry);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_service ON scored_opportunities(service_type);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_score ON scored_opportunities(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_level ON scored_opportunities(opportunity_level);
CREATE INDEX IF NOT EXISTS idx_scored_opportunities_calculated ON scored_opportunities(calculated_at DESC);

-- Enable Row Level Security
ALTER TABLE scored_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view opportunities in their organization"
  ON scored_opportunities FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Internal staff can insert opportunities"
  ON scored_opportunities FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can update opportunities"
  ON scored_opportunities FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Internal staff can delete opportunities"
  ON scored_opportunities FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_memberships
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_scored_opportunities_updated_at ON scored_opportunities;
CREATE TRIGGER update_scored_opportunities_updated_at
  BEFORE UPDATE ON scored_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunities_updated_at();
