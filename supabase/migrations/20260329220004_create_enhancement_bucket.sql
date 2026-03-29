-- Ensure the enhancement_media storage bucket exists strictly with support for huge files and resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'enhancement_media',
  'enhancement_media',
  false,
  6291456000, -- 6GB max
  '{video/mp4,video/webm,video/quicktime,video/avi,video/x-matroska,image/png,image/jpeg,image/webp,image/gif,application/octet-stream}'
)
ON CONFLICT (id) DO UPDATE 
SET file_size_limit = 6291456000,
    allowed_mime_types = '{video/mp4,video/webm,video/quicktime,video/avi,video/x-matroska,image/png,image/jpeg,image/webp,image/gif,application/octet-stream}';

-- Ensure isolated RLS patterns for the bucket items so TUS can stream accurately over the authenticated socket
DROP POLICY IF EXISTS "Upload access for enhancement_media" ON storage.objects;
CREATE POLICY "Upload access for enhancement_media" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'enhancement_media');

DROP POLICY IF EXISTS "Read access for enhancement_media" ON storage.objects;
CREATE POLICY "Read access for enhancement_media" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'enhancement_media');

DROP POLICY IF EXISTS "Update access for enhancement_media" ON storage.objects;
CREATE POLICY "Update access for enhancement_media" ON storage.objects
FOR UPDATE TO authenticated USING (bucket_id = 'enhancement_media');

DROP POLICY IF EXISTS "Delete access for enhancement_media" ON storage.objects;
CREATE POLICY "Delete access for enhancement_media" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'enhancement_media');
