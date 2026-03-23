/*
  # Add Service Types and Lead Categories

  1. New Types
    - Create service_type enum for categorizing leads and projects
    - Add industry segments
    
  2. Changes
    - Update leads table with service type enum
    - Update projects table with service type enum
    - Add engagement_type for distinguishing platform vs custom builds
    
  3. Categories
    - Platform Subscription
    - Custom Software Development
    - Dashboard & Analytics
    - Mobile App Development
    - AI & Automation
    - Enterprise Integration
    - Support & Retainer
*/

-- Create service type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'service_type') THEN
    CREATE TYPE service_type AS ENUM (
      'platform_subscription',
      'custom_software',
      'dashboard_analytics',
      'mobile_app',
      'ai_automation',
      'enterprise_integration',
      'support_retainer',
      'consultation'
    );
  END IF;
END $$;

-- Create engagement type enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'engagement_type') THEN
    CREATE TYPE engagement_type AS ENUM (
      'saas_platform',
      'custom_build',
      'hybrid'
    );
  END IF;
END $$;

-- Add service_type_category to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'service_type_category') THEN
    ALTER TABLE leads ADD COLUMN service_type_category service_type;
  END IF;
END $$;

-- Add engagement_type to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'engagement_type') THEN
    ALTER TABLE leads ADD COLUMN engagement_type engagement_type;
  END IF;
END $$;

-- Add budget_range to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'budget_range') THEN
    ALTER TABLE leads ADD COLUMN budget_range text;
  END IF;
END $$;

-- Add timeline to leads table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'timeline') THEN
    ALTER TABLE leads ADD COLUMN timeline text;
  END IF;
END $$;

-- Update projects table with service categorization
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'service_type_category') THEN
    ALTER TABLE projects ADD COLUMN service_type_category service_type;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'engagement_type') THEN
    ALTER TABLE projects ADD COLUMN engagement_type engagement_type DEFAULT 'custom_build';
  END IF;
END $$;

-- Add industry segment to organizations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'industry') THEN
    ALTER TABLE organizations ADD COLUMN industry text;
  END IF;
END $$;

-- Create index for service type queries
CREATE INDEX IF NOT EXISTS idx_leads_service_type ON leads(service_type_category) WHERE service_type_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_engagement_type ON leads(engagement_type) WHERE engagement_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_service_type ON projects(service_type_category) WHERE service_type_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_engagement_type ON projects(engagement_type) WHERE engagement_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_industry ON organizations(industry) WHERE industry IS NOT NULL;