-- ==============================================================================
-- Migration: Extend Support Systems & Live Sessions
-- Description: Appends recording paths and ephemeral WebRTC session hooks 
--              onto the native support_tickets table. Initializes the tightly
--              isolated `support_recordings` object storage bucket.
-- ==============================================================================

-- 1. Extend support_tickets schema
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS recording_path text,
ADD COLUMN IF NOT EXISTS recording_size numeric,
ADD COLUMN IF NOT EXISTS session_code text,
ADD COLUMN IF NOT EXISTS session_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_support_tickets_session_code ON public.support_tickets(session_code) WHERE session_code IS NOT NULL;

-- 2. Create the sandboxed Support Recordings Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'support_recordings',
    'support_recordings',
    false,
    104857600, -- 100MB limit for webm chunks
    ARRAY['video/webm', 'video/mp4']
) ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 104857600,
    allowed_mime_types = ARRAY['video/webm', 'video/mp4'];

-- 3. Strict Storage RLS Policies
-- Only creators (auth.uid() = owner) OR super_admins can touch these files
CREATE POLICY "Creators and Super Admins can view support recordings" 
ON storage.objects FOR SELECT TO authenticated USING (
    bucket_id = 'support_recordings' AND (
        auth.uid() = owner 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
);

CREATE POLICY "Users can upload support recordings" 
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'support_recordings' 
    AND auth.uid() = owner
);

CREATE POLICY "Users can delete own support recordings" 
ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'support_recordings' 
    AND auth.uid() = owner
);
