/*
  # Knowledge Base System

  1. New Tables
    - `knowledge_documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique) - URL-friendly identifier
      - `category` (text: 'onboarding_guides', 'system_documentation', 'integration_guides', 'client_instructions', 'internal_sops')
      - `content` (text) - markdown content
      - `excerpt` (text) - short description
      - `visibility` (text: 'internal', 'client', 'public') - who can access
      - `is_featured` (boolean) - show in featured section
      - `view_count` (integer) - track popularity
      - `tags` (text[]) - array of tags for filtering
      - `created_by` (uuid, references auth.users)
      - `updated_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `document_views`
      - `id` (uuid, primary key)
      - `document_id` (uuid, references knowledge_documents)
      - `user_id` (uuid, references auth.users)
      - `viewed_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Internal staff can manage all documents
    - Clients can view documents with 'client' or 'public' visibility
    - Track document views for analytics
*/

-- Knowledge Documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text CHECK (category IN (
    'onboarding_guides',
    'system_documentation',
    'integration_guides',
    'client_instructions',
    'internal_sops'
  )) NOT NULL,
  content text NOT NULL,
  excerpt text,
  visibility text CHECK (visibility IN ('internal', 'client', 'public')) DEFAULT 'internal',
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  tags text[] DEFAULT ARRAY[]::text[],
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_docs_category ON knowledge_documents(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_visibility ON knowledge_documents(visibility);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_featured ON knowledge_documents(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_slug ON knowledge_documents(slug);
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_tags ON knowledge_documents USING gin(tags);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Internal staff can view all documents"
  ON knowledge_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Clients can view client and public documents"
  ON knowledge_documents FOR SELECT
  TO authenticated
  USING (
    visibility IN ('client', 'public')
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

CREATE POLICY "Public can view public documents"
  ON knowledge_documents FOR SELECT
  TO anon
  USING (visibility = 'public');

CREATE POLICY "Internal staff can manage documents"
  ON knowledge_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Document Views
CREATE TABLE IF NOT EXISTS document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_document_views_doc ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_user ON document_views(user_id);
CREATE INDEX IF NOT EXISTS idx_document_views_date ON document_views(viewed_at DESC);

ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own document views"
  ON document_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can log document views"
  ON document_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Internal staff can view all document views"
  ON document_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- Function to update view count
CREATE OR REPLACE FUNCTION increment_document_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE knowledge_documents
  SET view_count = view_count + 1
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_view_count
AFTER INSERT ON document_views
FOR EACH ROW
EXECUTE FUNCTION increment_document_view_count();
