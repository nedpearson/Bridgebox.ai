-- Fix bb_global_tasks FK constraint names to match PostgREST hints used by the frontend.
-- The frontend queries with:
--   bb_profiles!global_tasks_assignee_id_fkey(...)
--   bb_profiles!global_tasks_creator_id_fkey(...)
-- PostgREST resolves joins by the actual postgres constraint name, so we rename them.

DO $$
BEGIN
  -- Drop the auto-generated FK constraints (names assigned by postgres when using inline REFERENCES)
  -- and recreate them with the explicit names the frontend expects.

  -- For assignee_id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'bb_global_tasks'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name != 'global_tasks_assignee_id_fkey'
      AND constraint_name LIKE '%assignee%'
  ) THEN
    -- Drop old auto-named constraint and recreate
    EXECUTE (
      SELECT 'ALTER TABLE bb_global_tasks DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'bb_global_tasks'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name != 'global_tasks_assignee_id_fkey'
        AND constraint_name LIKE '%assignee%'
      LIMIT 1
    );
  END IF;

  -- For creator_id
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'bb_global_tasks'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name != 'global_tasks_creator_id_fkey'
      AND constraint_name LIKE '%creator%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE bb_global_tasks DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'bb_global_tasks'
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name != 'global_tasks_creator_id_fkey'
        AND constraint_name LIKE '%creator%'
      LIMIT 1
    );
  END IF;
END $$;

-- Re-add with explicit names (idempotent - won't error if they already exist with the right name)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'bb_global_tasks' AND constraint_name = 'global_tasks_assignee_id_fkey'
  ) THEN
    ALTER TABLE bb_global_tasks
      ADD CONSTRAINT global_tasks_assignee_id_fkey
      FOREIGN KEY (assignee_id) REFERENCES bb_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'bb_global_tasks' AND constraint_name = 'global_tasks_creator_id_fkey'
  ) THEN
    ALTER TABLE bb_global_tasks
      ADD CONSTRAINT global_tasks_creator_id_fkey
      FOREIGN KEY (creator_id) REFERENCES bb_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Reload the PostgREST schema cache to pick up new constraint names
NOTIFY pgrst, 'reload schema';
