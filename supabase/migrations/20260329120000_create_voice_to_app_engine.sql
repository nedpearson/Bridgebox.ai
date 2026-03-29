-- ============================================================
-- Voice-to-App Engine + Workspace Enhancement Studio
-- Migration: 20260329120000
-- ============================================================

-- ── 1. bb_enhancement_requests ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_enhancement_requests (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id         uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  project_id           uuid REFERENCES public.bb_projects(id) ON DELETE SET NULL,
  created_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by           uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status               text NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','submitted','analyzing','ready_for_review','approved','rejected','ready_to_apply','applied','failed')),
  request_type         text CHECK (request_type IN ('new_feature','feature_modification','ui_enhancement','workflow_enhancement','integration_enhancement','reusable_transplant','workspace_merge','full_software_blueprint')),
  input_method         text NOT NULL DEFAULT 'text'
                         CHECK (input_method IN ('voice','text','recording','screenshot','mixed')),
  title                text NOT NULL,
  original_prompt      text,
  normalized_prompt    text,
  transcript           text,
  media_count          integer NOT NULL DEFAULT 0,
  analysis_summary     text,
  recommendations_json jsonb,
  dependency_summary   text,
  conflict_summary     text,
  approval_status      text CHECK (approval_status IN ('pending','approved','rejected')),
  applied_at           timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enhancement_requests_workspace   ON public.bb_enhancement_requests(workspace_id);
CREATE INDEX IF NOT EXISTS idx_enhancement_requests_status      ON public.bb_enhancement_requests(status);
CREATE INDEX IF NOT EXISTS idx_enhancement_requests_created_at  ON public.bb_enhancement_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enhancement_requests_project     ON public.bb_enhancement_requests(project_id) WHERE project_id IS NOT NULL;

-- ── 2. bb_voice_sessions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_voice_sessions (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id              uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  enhancement_request_id    uuid REFERENCES public.bb_enhancement_requests(id) ON DELETE SET NULL,
  created_by                uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  context_mode              text NOT NULL DEFAULT 'free_form'
                              CHECK (context_mode IN ('describe_current_software','describe_feature','describe_workflow','describe_final_vision','describe_changes','describe_pain_points','free_form')),
  raw_transcript            text NOT NULL DEFAULT '',
  cleaned_transcript        text,
  duration_seconds          integer NOT NULL DEFAULT 0,
  word_count                integer NOT NULL DEFAULT 0,
  language                  text NOT NULL DEFAULT 'en',
  status                    text NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('recording','draft','submitted','processed')),
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_workspace        ON public.bb_voice_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_request          ON public.bb_voice_sessions(enhancement_request_id) WHERE enhancement_request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_created_at       ON public.bb_voice_sessions(created_at DESC);

-- ── 3. bb_enhancement_media ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_enhancement_media (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enhancement_request_id    uuid NOT NULL REFERENCES public.bb_enhancement_requests(id) ON DELETE CASCADE,
  workspace_id              uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  uploaded_by               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  file_name                 text NOT NULL,
  file_type                 text NOT NULL CHECK (file_type IN ('video','screenshot','audio','document')),
  mime_type                 text NOT NULL,
  file_size_bytes           bigint NOT NULL DEFAULT 0,
  storage_path              text NOT NULL,
  storage_url               text,
  annotation                text,
  processing_status         text NOT NULL DEFAULT 'pending'
                              CHECK (processing_status IN ('pending','processing','analyzed','failed','needs_correction')),
  scene_count               integer,
  artifact_count            integer,
  confidence_score          numeric(4,3),
  analysis_json             jsonb,
  created_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enhancement_media_request    ON public.bb_enhancement_media(enhancement_request_id);
CREATE INDEX IF NOT EXISTS idx_enhancement_media_workspace  ON public.bb_enhancement_media(workspace_id);

-- ── 4. bb_workspace_profiles ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_workspace_profiles (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id             uuid NOT NULL UNIQUE REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  current_software_stack   text[] NOT NULL DEFAULT '{}',
  must_keep_features       text[] NOT NULL DEFAULT '{}',
  must_remove_features     text[] NOT NULL DEFAULT '{}',
  required_integrations    text[] NOT NULL DEFAULT '{}',
  preferred_ux_style       text NOT NULL DEFAULT '',
  workflow_rules           text[] NOT NULL DEFAULT '{}',
  approval_processes       text[] NOT NULL DEFAULT '{}',
  industry_context         text,
  enhancement_count        integer NOT NULL DEFAULT 0,
  last_updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_profiles_workspace ON public.bb_workspace_profiles(workspace_id);

-- ── 5. bb_workspace_transfer_batches ────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_workspace_transfer_batches (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_workspace_id   uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  target_workspace_id   uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  created_by            uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status                text NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','previewed','conflict_detected','approved','applying','applied','rolled_back','failed')),
  asset_types           text[] NOT NULL DEFAULT '{}',
  item_count            integer NOT NULL DEFAULT 0,
  conflict_count        integer NOT NULL DEFAULT 0,
  preview_json          jsonb,
  applied_at            timestamptz,
  rollback_data         jsonb,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_workspaces CHECK (source_workspace_id <> target_workspace_id)
);

CREATE INDEX IF NOT EXISTS idx_transfer_batches_source  ON public.bb_workspace_transfer_batches(source_workspace_id);
CREATE INDEX IF NOT EXISTS idx_transfer_batches_target  ON public.bb_workspace_transfer_batches(target_workspace_id);
CREATE INDEX IF NOT EXISTS idx_transfer_batches_status  ON public.bb_workspace_transfer_batches(status);

-- ── 6. bb_workspace_transfer_items ──────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_workspace_transfer_items (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              uuid NOT NULL REFERENCES public.bb_workspace_transfer_batches(id) ON DELETE CASCADE,
  asset_type            text NOT NULL,
  source_asset_id       text NOT NULL,
  source_workspace_id   uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  target_workspace_id   uuid NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  asset_name            text NOT NULL,
  asset_payload         jsonb,
  status                text NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','applied','skipped','conflict','failed')),
  conflict_resolution   text CHECK (conflict_resolution IN ('skip','rename','overwrite','unresolved')),
  rename_to             text,
  imported_asset_id     text,
  imported_at           timestamptz,
  import_note           text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_items_batch  ON public.bb_workspace_transfer_items(batch_id);

-- ── 7. bb_workspace_merge_audit_logs ────────────────────────
CREATE TABLE IF NOT EXISTS public.bb_workspace_merge_audit_logs (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id              uuid REFERENCES public.bb_workspace_transfer_batches(id) ON DELETE CASCADE,
  source_workspace_id   uuid REFERENCES public.bb_organizations(id) ON DELETE SET NULL,
  target_workspace_id   uuid REFERENCES public.bb_organizations(id) ON DELETE SET NULL,
  asset_type            text,
  asset_name            text,
  action                text NOT NULL,
  performed_by          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merge_audit_batch   ON public.bb_workspace_merge_audit_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_merge_audit_target  ON public.bb_workspace_merge_audit_logs(target_workspace_id);

-- ── RLS: Enable on all tables ────────────────────────────────
ALTER TABLE public.bb_enhancement_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_voice_sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_enhancement_media           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_workspace_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_workspace_transfer_batches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_workspace_transfer_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_workspace_merge_audit_logs  ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: Enhancement Requests ──────────────────────
CREATE POLICY "enhancement_requests_member_select" ON public.bb_enhancement_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

CREATE POLICY "enhancement_requests_member_insert" ON public.bb_enhancement_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

CREATE POLICY "enhancement_requests_member_update" ON public.bb_enhancement_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

CREATE POLICY "enhancement_requests_member_delete" ON public.bb_enhancement_requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

-- ── RLS Policies: Voice Sessions ────────────────────────────
CREATE POLICY "voice_sessions_member_all" ON public.bb_voice_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

-- ── RLS Policies: Enhancement Media ─────────────────────────
CREATE POLICY "enhancement_media_member_all" ON public.bb_enhancement_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

-- ── RLS Policies: Workspace Profiles ────────────────────────
CREATE POLICY "workspace_profiles_member_all" ON public.bb_workspace_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = workspace_id
    )
  );

-- ── RLS Policies: Transfer Batches ──────────────────────────
CREATE POLICY "transfer_batches_member_select" ON public.bb_workspace_transfer_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid())
        AND (m.organization_id = source_workspace_id OR m.organization_id = target_workspace_id)
    )
  );

CREATE POLICY "transfer_batches_member_insert" ON public.bb_workspace_transfer_batches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = target_workspace_id
    )
  );

CREATE POLICY "transfer_batches_member_update" ON public.bb_workspace_transfer_batches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = target_workspace_id
    )
  );

-- ── RLS Policies: Transfer Items ─────────────────────────────
CREATE POLICY "transfer_items_member_all" ON public.bb_workspace_transfer_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bb_workspace_transfer_batches b
      JOIN public.bb_organization_memberships m ON (m.organization_id = b.target_workspace_id OR m.organization_id = b.source_workspace_id)
      WHERE b.id = batch_id AND m.user_id = (SELECT auth.uid())
    )
  );

-- ── RLS Policies: Merge Audit Logs ───────────────────────────
CREATE POLICY "merge_audit_member_select" ON public.bb_workspace_merge_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bb_organization_memberships m
      WHERE m.user_id = (SELECT auth.uid())
        AND (m.organization_id = target_workspace_id OR m.organization_id = source_workspace_id)
    )
  );

CREATE POLICY "merge_audit_system_insert" ON public.bb_workspace_merge_audit_logs
  FOR INSERT WITH CHECK (true);

-- ── Triggers: updated_at ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_enhancement_requests_updated_at') THEN
    CREATE TRIGGER set_enhancement_requests_updated_at
      BEFORE UPDATE ON public.bb_enhancement_requests
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_voice_sessions_updated_at') THEN
    CREATE TRIGGER set_voice_sessions_updated_at
      BEFORE UPDATE ON public.bb_voice_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_transfer_batches_updated_at') THEN
    CREATE TRIGGER set_transfer_batches_updated_at
      BEFORE UPDATE ON public.bb_workspace_transfer_batches
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
