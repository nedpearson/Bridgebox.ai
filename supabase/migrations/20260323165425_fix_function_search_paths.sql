/*
  # Fix Function Search Paths

  1. Security Improvement
    - Set search_path to empty string or specific schemas to prevent role-based manipulation
    - Prevents search_path injection attacks
    
  2. Functions Updated
    - update_workflow_timestamp
    - calculate_execution_duration
    - increment_workflow_execution_count
    - update_document_timestamp
    - update_document_on_analysis
    - create_document_processing_tasks
    - update_extracted_data_timestamp
    - get_next_queue_item
    - update_white_label_updated_at
*/

-- Workflow functions
CREATE OR REPLACE FUNCTION public.update_workflow_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_execution_duration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_workflow_execution_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.workflows
  SET execution_count = COALESCE(execution_count, 0) + 1,
      last_executed_at = NEW.started_at
  WHERE id = NEW.workflow_id;
  RETURN NEW;
END;
$$;

-- Document functions
CREATE OR REPLACE FUNCTION public.update_document_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_document_on_analysis()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.documents
  SET 
    content_type = COALESCE(NEW.content_type, content_type),
    updated_at = now()
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_document_processing_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.document_processing_queue (
    document_id,
    organization_id,
    task_type,
    priority,
    status
  ) VALUES
    (NEW.id, NEW.organization_id, 'text_extraction', 1, 'pending'),
    (NEW.id, NEW.organization_id, 'entity_recognition', 2, 'pending'),
    (NEW.id, NEW.organization_id, 'classification', 3, 'pending');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_extracted_data_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_next_queue_item()
RETURNS TABLE (
  id uuid,
  document_id uuid,
  task_type text,
  priority integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.document_id,
    q.task_type,
    q.priority
  FROM public.document_processing_queue q
  WHERE q.status = 'pending'
  ORDER BY q.priority ASC, q.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
END;
$$;

-- White label function
CREATE OR REPLACE FUNCTION public.update_white_label_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
