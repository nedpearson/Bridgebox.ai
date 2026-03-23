/*
  # Add File Storage Columns

  1. Changes to deliverables table
    - Add file_path column for storage path
    - Add file_size column for file size in bytes
    - Add file_type column for mime type
    - Add file_name column for original file name

  2. Changes to support_tickets table
    - Add attachment_paths column for array of file paths
    - Add attachment_count column for quick access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliverables' AND column_name = 'file_path'
  ) THEN
    ALTER TABLE deliverables ADD COLUMN file_path text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliverables' AND column_name = 'file_size'
  ) THEN
    ALTER TABLE deliverables ADD COLUMN file_size bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliverables' AND column_name = 'file_type'
  ) THEN
    ALTER TABLE deliverables ADD COLUMN file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deliverables' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE deliverables ADD COLUMN file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'attachment_paths'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN attachment_paths text[] DEFAULT ARRAY[]::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_tickets' AND column_name = 'attachment_count'
  ) THEN
    ALTER TABLE support_tickets ADD COLUMN attachment_count integer DEFAULT 0;
  END IF;
END $$;
