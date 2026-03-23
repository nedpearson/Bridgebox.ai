/*
  # Document Processing Pipeline

  This migration creates a background processing pipeline for documents that enables
  automatic text extraction, classification, and structured data extraction.

  ## New Tables

  ### `document_processing_queue`
  Queue for managing document processing tasks
  
  Columns:
  - `id` (uuid, primary key) - Unique queue item identifier
  - `document_id` (uuid) - Reference to document being processed
  - `organization_id` (uuid) - Organization that owns the document
  - `priority` (integer) - Processing priority (higher = sooner)
  - `status` (text) - Queue status: pending, processing, completed, failed, retrying
  - `task_type` (text) - Type of processing: extract_text, classify, extract_data, analyze
  - `retry_count` (integer) - Number of retry attempts
  - `max_retries` (integer) - Maximum allowed retries
  - `error_message` (text) - Error details if failed
  - `started_at` (timestamptz) - When processing started
  - `completed_at` (timestamptz) - When processing completed
  - `processing_data` (jsonb) - Processing parameters and results

  ### `document_processing_history`
  Historical record of all processing attempts
  
  Columns:
  - `id` (uuid, primary key) - Unique history record identifier
  - `queue_id` (uuid) - Reference to queue item
  - `document_id` (uuid) - Reference to document
  - `task_type` (text) - Type of processing performed
  - `status` (text) - Result status
  - `duration_ms` (integer) - Processing duration in milliseconds
  - `error_message` (text) - Error details if failed
  - `result_data` (jsonb) - Processing results

  ### `document_extracted_data`
  Structured data extracted from documents
  
  Columns:
  - `id` (uuid, primary key) - Unique extraction identifier
  - `document_id` (uuid) - Reference to document
  - `data_type` (text) - Type of extracted data: invoice, contract, receipt, form, table
  - `confidence` (decimal) - Extraction confidence (0-1)
  - `extracted_fields` (jsonb) - Structured field data
  - `validation_status` (text) - Validation status: pending, valid, invalid, needs_review
  - `validated_by` (uuid) - User who validated the data
  - `validated_at` (timestamptz) - When data was validated

  ## Security

  RLS enabled on all tables restricting access to organization members
*/

-- ============================================================================
-- DOCUMENT PROCESSING QUEUE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  
  -- Queue management
  priority integer DEFAULT 5 NOT NULL CHECK (priority >= 1 AND priority <= 10),
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retrying')),
  task_type text NOT NULL CHECK (task_type IN ('extract_text', 'classify', 'extract_data', 'analyze', 'full_process')),
  
  -- Retry logic
  retry_count integer DEFAULT 0 NOT NULL CHECK (retry_count >= 0),
  max_retries integer DEFAULT 3 NOT NULL CHECK (max_retries > 0),
  error_message text,
  
  -- Timing
  created_at timestamptz DEFAULT now() NOT NULL,
  started_at timestamptz,
  completed_at timestamptz,
  
  -- Processing details
  processing_data jsonb DEFAULT '{}'::jsonb NOT NULL
);

-- Indexes for queue
CREATE INDEX idx_queue_status ON document_processing_queue(status, priority DESC, created_at) WHERE status IN ('pending', 'retrying');
CREATE INDEX idx_queue_document ON document_processing_queue(document_id);
CREATE INDEX idx_queue_organization ON document_processing_queue(organization_id);
CREATE INDEX idx_queue_task_type ON document_processing_queue(task_type, status);

-- RLS for queue
ALTER TABLE document_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organization queue items"
  ON document_processing_queue FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = document_processing_queue.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage queue items"
  ON document_processing_queue FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = document_processing_queue.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENT PROCESSING HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_processing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES document_processing_queue(id) ON DELETE CASCADE,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  
  task_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'failed', 'cancelled')),
  duration_ms integer CHECK (duration_ms >= 0),
  error_message text,
  result_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for history
CREATE INDEX idx_history_document ON document_processing_history(document_id, created_at DESC);
CREATE INDEX idx_history_queue ON document_processing_history(queue_id) WHERE queue_id IS NOT NULL;
CREATE INDEX idx_history_status ON document_processing_history(status, created_at DESC);

-- RLS for history
ALTER TABLE document_processing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view processing history"
  ON document_processing_history FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_processing_history.document_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create history records"
  ON document_processing_history FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_processing_history.document_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- DOCUMENT EXTRACTED DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_extracted_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  
  -- Extraction details
  data_type text NOT NULL CHECK (data_type IN ('invoice', 'contract', 'receipt', 'form', 'table', 'other')),
  confidence decimal(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  extracted_fields jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Validation
  validation_status text DEFAULT 'pending' NOT NULL CHECK (validation_status IN ('pending', 'valid', 'invalid', 'needs_review')),
  validated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  validated_at timestamptz,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for extracted data
CREATE INDEX idx_extracted_data_document ON document_extracted_data(document_id);
CREATE INDEX idx_extracted_data_type ON document_extracted_data(data_type);
CREATE INDEX idx_extracted_data_validation ON document_extracted_data(validation_status);

-- RLS for extracted data
ALTER TABLE document_extracted_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view extracted data"
  ON document_extracted_data FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_extracted_data.document_id
      AND om.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage extracted data"
  ON document_extracted_data FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      JOIN organization_memberships om ON om.organization_id = d.organization_id
      WHERE d.id = document_extracted_data.document_id
      AND om.user_id = auth.uid()
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to automatically create processing queue items when document is created
CREATE OR REPLACE FUNCTION create_document_processing_tasks()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO document_processing_queue (
    document_id,
    organization_id,
    task_type,
    priority,
    status
  ) VALUES (
    NEW.id,
    NEW.organization_id,
    'full_process',
    5,
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_document_processing_tasks
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_document_processing_tasks();

-- Function to update extracted data timestamp
CREATE OR REPLACE FUNCTION update_extracted_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_extracted_data_timestamp
  BEFORE UPDATE ON document_extracted_data
  FOR EACH ROW
  EXECUTE FUNCTION update_extracted_data_timestamp();

-- Function to get next pending queue item
CREATE OR REPLACE FUNCTION get_next_queue_item(p_task_type text DEFAULT NULL)
RETURNS uuid AS $$
DECLARE
  v_queue_id uuid;
BEGIN
  SELECT id INTO v_queue_id
  FROM document_processing_queue
  WHERE status IN ('pending', 'retrying')
    AND (p_task_type IS NULL OR task_type = p_task_type)
  ORDER BY priority DESC, created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
  
  IF v_queue_id IS NOT NULL THEN
    UPDATE document_processing_queue
    SET status = 'processing', started_at = now()
    WHERE id = v_queue_id;
  END IF;
  
  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;