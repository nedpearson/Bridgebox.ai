/*
  # Document Intelligence System

  This migration creates a comprehensive document intelligence system for Bridgebox
  that can ingest, analyze, and organize business documents using AI.

  ## New Tables

  ### `documents`
  Main documents table storing uploaded files and their metadata
  
  Columns:
  - `id` (uuid, primary key) - Unique document identifier
  - `organization_id` (uuid) - Organization that owns this document
  - `uploaded_by` (uuid) - User who uploaded the document
  - `file_name` (text) - Original file name
  - `file_size` (integer) - File size in bytes
  - `file_type` (text) - MIME type of the file
  - `storage_path` (text) - Path in storage bucket
  - `document_type` (text) - Classification: financial, legal, operational, contract, report, other
  - `category` (text) - Sub-category for organization
  - `status` (text) - Processing status: uploading, processing, completed, failed
  - `is_processed` (boolean) - Whether AI processing is complete
  - `project_id` (uuid) - Associated project (optional)
  - `client_id` (uuid) - Associated client (optional)
  - `extracted_text` (text) - Raw text extracted from document
  - `page_count` (integer) - Number of pages in document
  - `language` (text) - Detected document language
  - `tags` (text[]) - User-defined tags
  - `metadata` (jsonb) - Additional metadata

  ### `document_analysis`
  AI-powered analysis results for documents
  
  Columns:
  - `id` (uuid, primary key) - Unique analysis identifier
  - `document_id` (uuid) - Reference to document
  - `summary` (text) - AI-generated summary
  - `key_entities` (jsonb) - Extracted entities (people, organizations, dates, amounts)
  - `key_values` (jsonb) - Extracted key-value pairs
  - `sentiment` (text) - Document sentiment: positive, negative, neutral
  - `confidence_score` (decimal) - Analysis confidence (0-1)
  - `processing_time_ms` (integer) - Time taken for analysis
  - `model_used` (text) - AI model used for analysis
  - `analysis_date` (timestamptz) - When analysis was performed

  ### `document_versions`
  Version history for documents
  
  Columns:
  - `id` (uuid, primary key) - Unique version identifier
  - `document_id` (uuid) - Reference to document
  - `version_number` (integer) - Sequential version number
  - `file_name` (text) - File name for this version
  - `storage_path` (text) - Storage path for this version
  - `file_size` (integer) - File size in bytes
  - `uploaded_by` (uuid) - User who uploaded this version
  - `change_description` (text) - Description of changes
  - `created_at` (timestamptz) - When version was created

  ## Security

  RLS enabled on all tables restricting access to organization members
*/

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- File information
  file_name text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0),
  file_type text NOT NULL,
  storage_path text NOT NULL,
  
  -- Classification
  document_type text NOT NULL CHECK (document_type IN ('financial', 'legal', 'operational', 'contract', 'report', 'other')),
  category text,
  status text DEFAULT 'uploading' NOT NULL CHECK (status IN ('uploading', 'processing', 'completed', 'failed')),
  is_processed boolean DEFAULT false NOT NULL,
  
  -- Associations
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  client_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Extracted content
  extracted_text text,
  page_count integer CHECK (page_count > 0),
  language text,
  
  -- Organization
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz
);

-- Indexes for documents
CREATE INDEX idx_documents_organization ON documents(organization_id);
CREATE INDEX idx_documents_type ON documents(organization_id, document_type);
CREATE INDEX idx_documents_status ON documents(organization_id, status);
CREATE INDEX idx_documents_project ON documents(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_documents_client ON documents(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by) WHERE uploaded_by IS NOT NULL;
CREATE INDEX idx_documents_created ON documents(organization_id, created_at DESC);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);
CREATE INDEX idx_documents_text_search ON documents USING gin(to_tsvector('english', COALESCE(extracted_text, '') || ' ' || file_name));

-- RLS for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization documents"
  ON documents FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = documents.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload documents"
  ON documents FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = documents.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update organization documents"
  ON documents FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = documents.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and staff can delete documents"
  ON documents FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = documents.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

-- ============================================================================
-- DOCUMENT ANALYSIS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- AI analysis results
  summary text,
  key_entities jsonb DEFAULT '{}'::jsonb NOT NULL,
  key_values jsonb DEFAULT '{}'::jsonb NOT NULL,
  sentiment text CHECK (sentiment IN ('positive', 'negative', 'neutral', 'mixed')),
  confidence_score decimal(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Processing metadata
  processing_time_ms integer,
  model_used text,
  analysis_date timestamptz DEFAULT now() NOT NULL,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for document_analysis
CREATE INDEX idx_document_analysis_document ON document_analysis(document_id);
CREATE INDEX idx_document_analysis_sentiment ON document_analysis(sentiment) WHERE sentiment IS NOT NULL;

-- RLS for document_analysis
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document analysis"
  ON document_analysis FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_analysis.document_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage document analysis"
  ON document_analysis FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_analysis.document_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENT VERSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  
  version_number integer NOT NULL CHECK (version_number > 0),
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0),
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  change_description text,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  
  UNIQUE(document_id, version_number)
);

-- Indexes for document_versions
CREATE INDEX idx_document_versions_document ON document_versions(document_id, version_number DESC);

-- RLS for document_versions
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view document versions"
  ON document_versions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_versions.document_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create document versions"
  ON document_versions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_versions.document_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update document updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_timestamp
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp();

-- Function to update document status when analysis completes
CREATE OR REPLACE FUNCTION update_document_on_analysis()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE documents
  SET
    is_processed = true,
    status = 'completed',
    processed_at = now()
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_on_analysis
  AFTER INSERT OR UPDATE ON document_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_document_on_analysis();