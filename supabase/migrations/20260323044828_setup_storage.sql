/*
  # Setup Supabase Storage for File Uploads

  1. Storage Buckets
    - `deliverables` - Client project deliverables (50MB limit)
    - `support_attachments` - Support ticket attachments (10MB limit)
    - `client_documents` - General client documents (50MB limit)
    - `internal_assets` - Internal reference files (50MB limit)

  2. Security
    - Enable RLS on all buckets
    - Organization-scoped access policies
    - Authenticated users can upload to their organization's folders
    - Users can only access files from their organizations

  3. Storage Structure
    - deliverables/{organization_id}/{project_id}/{file_name}
    - support_attachments/{organization_id}/{ticket_id}/{file_name}
    - client_documents/{organization_id}/{file_name}
    - internal_assets/{file_name}
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('deliverables', 'deliverables', false, 52428800, ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/quicktime',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  ('support_attachments', 'support_attachments', false, 10485760, ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'video/mp4',
    'video/quicktime'
  ]),
  ('client_documents', 'client_documents', false, 52428800, ARRAY[
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'image/jpeg',
    'image/png',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]),
  ('internal_assets', 'internal_assets', false, 52428800, null)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload deliverables to their organization projects"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'deliverables' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view deliverables from their organizations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'deliverables' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete deliverables from their organization projects"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'deliverables' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload support attachments to their organization"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'support_attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view support attachments from their organizations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'support_attachments' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload client documents to their organization"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'client_documents' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view client documents from their organizations"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'client_documents' AND
    (storage.foldername(name))[1] IN (
      SELECT organization_id::text
      FROM organization_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can view internal assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'internal_assets');

CREATE POLICY "Staff users can manage internal assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'internal_assets' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );
