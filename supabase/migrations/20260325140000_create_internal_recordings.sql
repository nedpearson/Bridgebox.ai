-- Create internal_recordings table
CREATE TABLE IF NOT EXISTS public.internal_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  module_reference text,
  duration integer, -- in seconds
  size integer,     -- in bytes
  mime_type text,
  storage_path text NOT NULL,
  status text DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'ready', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internal_recordings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for internal_recordings
-- Only super_admin can read/write to this table
CREATE POLICY "Super admin can view internal recordings"
  ON public.internal_recordings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can insert internal recordings"
  ON public.internal_recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update internal recordings"
  ON public.internal_recordings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete internal recordings"
  ON public.internal_recordings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create storage bucket for internal tools
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'internal-recordings',
  'internal-recordings',
  false,
  524288000, -- 500MB roughly
  ARRAY['video/webm', 'video/mp4', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for internal-recordings bucket
CREATE POLICY "Super admin can view internal recordings bucket"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'internal-recordings' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can insert into internal recordings bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'internal-recordings' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update internal recordings bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'internal-recordings' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete from internal recordings bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'internal-recordings' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_internal_recordings_updated_at ON public.internal_recordings;
CREATE TRIGGER set_internal_recordings_updated_at
BEFORE UPDATE ON public.internal_recordings
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();
