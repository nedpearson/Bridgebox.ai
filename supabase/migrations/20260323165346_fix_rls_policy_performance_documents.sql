/*
  # Fix RLS Policy Performance - Documents

  1. Performance Optimization
    - Wrap auth.uid() calls with SELECT for document-related policies
    
  2. Tables Updated
    - documents (4 policies)
    - document_analysis (2 policies)
    - document_versions (2 policies)
    - document_processing_history (2 policies)
    - document_processing_queue (2 policies)
    - document_extracted_data (2 policies)
*/

-- Documents policies
DROP POLICY IF EXISTS "Users can view organization documents" ON public.documents;
CREATE POLICY "Users can view organization documents"
  ON public.documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = documents.organization_id
    )
  );

DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;
CREATE POLICY "Users can upload documents"
  ON public.documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = documents.organization_id
    )
  );

DROP POLICY IF EXISTS "Users can update organization documents" ON public.documents;
CREATE POLICY "Users can update organization documents"
  ON public.documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = documents.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = documents.organization_id
    )
  );

DROP POLICY IF EXISTS "Admins and staff can delete documents" ON public.documents;
CREATE POLICY "Admins and staff can delete documents"
  ON public.documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = documents.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

-- Document analysis policies
DROP POLICY IF EXISTS "Users can view document analysis" ON public.document_analysis;
CREATE POLICY "Users can view document analysis"
  ON public.document_analysis
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_analysis.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage document analysis" ON public.document_analysis;
CREATE POLICY "System can manage document analysis"
  ON public.document_analysis
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_analysis.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- Document versions policies
DROP POLICY IF EXISTS "Users can view document versions" ON public.document_versions;
CREATE POLICY "Users can view document versions"
  ON public.document_versions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_versions.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create document versions" ON public.document_versions;
CREATE POLICY "Users can create document versions"
  ON public.document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_versions.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- Document processing history policies
DROP POLICY IF EXISTS "Users can view processing history" ON public.document_processing_history;
CREATE POLICY "Users can view processing history"
  ON public.document_processing_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_processing_history.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can create history records" ON public.document_processing_history;
CREATE POLICY "System can create history records"
  ON public.document_processing_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_processing_history.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- Document processing queue policies
DROP POLICY IF EXISTS "Users can view organization queue items" ON public.document_processing_queue;
CREATE POLICY "Users can view organization queue items"
  ON public.document_processing_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = document_processing_queue.organization_id
    )
  );

DROP POLICY IF EXISTS "System can manage queue items" ON public.document_processing_queue;
CREATE POLICY "System can manage queue items"
  ON public.document_processing_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = document_processing_queue.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

-- Document extracted data policies
DROP POLICY IF EXISTS "Users can view extracted data" ON public.document_extracted_data;
CREATE POLICY "Users can view extracted data"
  ON public.document_extracted_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_extracted_data.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage extracted data" ON public.document_extracted_data;
CREATE POLICY "System can manage extracted data"
  ON public.document_extracted_data
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.documents
      JOIN public.organization_memberships ON organization_memberships.organization_id = documents.organization_id
      WHERE documents.id = document_extracted_data.document_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );
