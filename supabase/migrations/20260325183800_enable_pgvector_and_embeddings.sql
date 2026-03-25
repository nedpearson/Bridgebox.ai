-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a generic embeddings table for all Bridgebox entities
CREATE TABLE IF NOT EXISTS public.platform_embeddings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL, -- 'document', 'communication', 'task', etc.
    entity_id UUID NOT NULL,   -- The ID of the specific entity
    content TEXT NOT NULL,     -- The raw text used to generate the embedding
    embedding VECTOR(1536),    -- OpenAI text-embedding-3-small embeddings are 1536 dimensions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index the embeddings for faster vector proximity searches (using HNSW)
CREATE INDEX IF NOT EXISTS platform_embeddings_embedding_idx 
ON public.platform_embeddings USING hnsw (embedding vector_cosine_ops);

-- Index the lookup columns for fast entity scans
CREATE INDEX IF NOT EXISTS platform_embeddings_org_idx ON public.platform_embeddings(organization_id);
CREATE INDEX IF NOT EXISTS platform_embeddings_entity_idx ON public.platform_embeddings(entity_type, entity_id);

-- Trigger for updated_at
CREATE TRIGGER update_platform_embeddings_updated_at
    BEFORE UPDATE ON public.platform_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Implement Row-Level Security
ALTER TABLE public.platform_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view embeddings in their organization"
    ON public.platform_embeddings FOR SELECT
    TO authenticated
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert embeddings in their organization"
    ON public.platform_embeddings FOR INSERT
    TO authenticated
    WITH CHECK (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can update embeddings in their organization"
    ON public.platform_embeddings FOR UPDATE
    TO authenticated
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete embeddings in their organization"
    ON public.platform_embeddings FOR DELETE
    TO authenticated
    USING (organization_id = (SELECT organization_id FROM public.users WHERE id = auth.uid()));

-- Create the similarity search RPC function for cross-module semantic searches
CREATE OR REPLACE FUNCTION match_platform_embeddings (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  p_organization_id UUID
)
RETURNS TABLE (
  id UUID,
  entity_type TEXT,
  entity_id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER -- Ensures the function can execute securely while honoring RLS at invocation
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.entity_type,
    e.entity_id,
    e.content,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM public.platform_embeddings e
  WHERE 
    e.organization_id = p_organization_id
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
