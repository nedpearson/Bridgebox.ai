-- Add metadata JSONB column for Advanced CRM topologies and backwards compatibility
ALTER TABLE bb_organizations 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create a GIN index to support high performance querying inside the JSONB structure
CREATE INDEX IF NOT EXISTS idx_bb_organizations_metadata ON bb_organizations USING gin (metadata);
