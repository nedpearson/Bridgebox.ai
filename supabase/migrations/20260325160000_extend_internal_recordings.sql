-- Refactor configuration: Unified Recording Center
-- Extend internal_recordings to support Development Mode and Enhanced Navigation

-- 1. Add new columns for Development Mode metadata and auditing
ALTER TABLE public.internal_recordings 
ADD COLUMN IF NOT EXISTS recording_mode text DEFAULT 'standard' CHECK (recording_mode IN ('standard', 'development')),
ADD COLUMN IF NOT EXISTS intended_use text,
ADD COLUMN IF NOT EXISTS build_notes text,
ADD COLUMN IF NOT EXISTS feature_request_notes text,
ADD COLUMN IF NOT EXISTS email_share_history jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

-- 2. Safely replace the status constraint to support the requested unified statuses
-- Expected statuses: draft, recording, uploading, processing, ready, failed, archived
DO $$
DECLARE
    rec record;
BEGIN
    FOR rec IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.internal_recordings'::regclass 
        AND contype = 'c' 
        AND pg_get_constraintdef(oid) LIKE '%status%'
    LOOP
        EXECUTE 'ALTER TABLE public.internal_recordings DROP CONSTRAINT ' || quote_ident(rec.conname);
    END LOOP;
END $$;

ALTER TABLE public.internal_recordings 
ADD CONSTRAINT internal_recordings_status_check 
CHECK (status IN ('draft', 'recording', 'uploading', 'processing', 'ready', 'saved', 'failed', 'archived'));
