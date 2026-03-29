-- ============================================================
-- Missing BB Tables Fix
-- Creates bb_global_tasks, bb_agent_actions_queue, and
-- bb_intelligence_events which are referenced by the app but
-- were never created in a migration.
-- ============================================================

-- ---------------------------------------------------------------
-- 1. bb_global_tasks
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_global_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES bb_organizations(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Explicit constraint names match the PostgREST fkey hints used in the frontend:
  -- bb_profiles!global_tasks_assignee_id_fkey and bb_profiles!global_tasks_creator_id_fkey
  assignee_id uuid,
  creator_id uuid,
  CONSTRAINT global_tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES bb_profiles(id) ON DELETE SET NULL,
  CONSTRAINT global_tasks_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES bb_profiles(id) ON DELETE SET NULL,
  due_date timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Named FK indexes (match the fkey aliases used in the app select queries)
CREATE INDEX IF NOT EXISTS idx_bb_global_tasks_tenant ON bb_global_tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bb_global_tasks_assignee ON bb_global_tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_bb_global_tasks_creator ON bb_global_tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_bb_global_tasks_status ON bb_global_tasks(status);

ALTER TABLE bb_global_tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_global_tasks' AND policyname='Users can view tasks in their organization'
  ) THEN
    CREATE POLICY "Users can view tasks in their organization"
      ON bb_global_tasks FOR SELECT TO authenticated
      USING (
        tenant_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_global_tasks' AND policyname='Users can insert tasks in their organization'
  ) THEN
    CREATE POLICY "Users can insert tasks in their organization"
      ON bb_global_tasks FOR INSERT TO authenticated
      WITH CHECK (
        tenant_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_global_tasks' AND policyname='Users can update tasks in their organization'
  ) THEN
    CREATE POLICY "Users can update tasks in their organization"
      ON bb_global_tasks FOR UPDATE TO authenticated
      USING (
        tenant_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_global_tasks' AND policyname='Users can delete tasks in their organization'
  ) THEN
    CREATE POLICY "Users can delete tasks in their organization"
      ON bb_global_tasks FOR DELETE TO authenticated
      USING (
        tenant_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_bb_global_tasks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_bb_global_tasks_updated_at ON bb_global_tasks;
CREATE TRIGGER trg_bb_global_tasks_updated_at
  BEFORE UPDATE ON bb_global_tasks
  FOR EACH ROW EXECUTE FUNCTION update_bb_global_tasks_updated_at();


-- ---------------------------------------------------------------
-- 2. bb_agent_actions_queue
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_agent_actions_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES bb_organizations(id) ON DELETE CASCADE NOT NULL,
  action_type text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'executed', 'failed', 'expired')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  payload jsonb DEFAULT '{}'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  reasoning text,
  confidence_score integer CHECK (confidence_score >= 0 AND confidence_score <= 100),
  requires_approval boolean DEFAULT true,
  is_destructive boolean DEFAULT false,
  suggested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  reviewer_notes text,
  executed_at timestamptz,
  execution_result jsonb,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bb_agent_queue_org ON bb_agent_actions_queue(organization_id);
CREATE INDEX IF NOT EXISTS idx_bb_agent_queue_status ON bb_agent_actions_queue(status);
CREATE INDEX IF NOT EXISTS idx_bb_agent_queue_priority ON bb_agent_actions_queue(priority);
CREATE INDEX IF NOT EXISTS idx_bb_agent_queue_created ON bb_agent_actions_queue(created_at DESC);

ALTER TABLE bb_agent_actions_queue ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_agent_actions_queue' AND policyname='Users can view actions in their organization'
  ) THEN
    CREATE POLICY "Users can view actions in their organization"
      ON bb_agent_actions_queue FOR SELECT TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_agent_actions_queue' AND policyname='Internal staff can insert actions'
  ) THEN
    CREATE POLICY "Internal staff can insert actions"
      ON bb_agent_actions_queue FOR INSERT TO authenticated
      WITH CHECK (
        organization_id IN (
          SELECT organization_id FROM bb_organization_memberships
          WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_agent_actions_queue' AND policyname='Users can update actions in their organization'
  ) THEN
    CREATE POLICY "Users can update actions in their organization"
      ON bb_agent_actions_queue FOR UPDATE TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id FROM bb_organization_memberships WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_bb_agent_queue_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_bb_agent_queue_updated_at ON bb_agent_actions_queue;
CREATE TRIGGER trg_bb_agent_queue_updated_at
  BEFORE UPDATE ON bb_agent_actions_queue
  FOR EACH ROW EXECUTE FUNCTION update_bb_agent_queue_updated_at();


-- ---------------------------------------------------------------
-- 3. bb_intelligence_events
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_intelligence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES bb_organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  feature text,
  action text,
  context jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  session_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bb_intelligence_org ON bb_intelligence_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_bb_intelligence_user ON bb_intelligence_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bb_intelligence_type ON bb_intelligence_events(event_type);
CREATE INDEX IF NOT EXISTS idx_bb_intelligence_feature ON bb_intelligence_events(feature);
CREATE INDEX IF NOT EXISTS idx_bb_intelligence_created ON bb_intelligence_events(created_at DESC);

ALTER TABLE bb_intelligence_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_intelligence_events' AND policyname='Admins can view intelligence events'
  ) THEN
    CREATE POLICY "Admins can view intelligence events"
      ON bb_intelligence_events FOR SELECT TO authenticated
      USING (
        organization_id IN (
          SELECT organization_id FROM bb_organization_memberships
          WHERE user_id = auth.uid() AND role IN ('super_admin', 'internal_staff', 'client_admin')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename='bb_intelligence_events' AND policyname='Authenticated users can insert intelligence events'
  ) THEN
    CREATE POLICY "Authenticated users can insert intelligence events"
      ON bb_intelligence_events FOR INSERT TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;
