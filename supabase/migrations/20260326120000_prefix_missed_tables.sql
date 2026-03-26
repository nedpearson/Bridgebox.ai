-- ============================================================
-- BRIDGEBOX: PREFIX REMAINING MISSED TABLES 
-- Applies the bb_ prefix to newly identified missing edge-case tables
-- Uses IF EXISTS to be idempotent.
-- ============================================================

DO $$
BEGIN

  -- Missed Generative AI Onboarding Sessions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='onboarding_sessions') THEN
    ALTER TABLE public.onboarding_sessions RENAME TO bb_onboarding_sessions;
  END IF;

  -- Missed System Internal Recordings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='internal_recordings') THEN
    ALTER TABLE public.internal_recordings RENAME TO bb_internal_recordings;
  END IF;

  -- Missed Entity Link Governance Core
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='entity_links') THEN
    ALTER TABLE public.entity_links RENAME TO bb_entity_links;
  END IF;

  -- Missed Webhook Pipelines
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='integration_webhooks') THEN
    ALTER TABLE public.integration_webhooks RENAME TO bb_integration_webhooks;
  END IF;

  -- External System Tracking
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='external_object_links') THEN
    ALTER TABLE public.external_object_links RENAME TO bb_external_object_links;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='external_messages') THEN
    ALTER TABLE public.external_messages RENAME TO bb_external_messages;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='external_contacts') THEN
    ALTER TABLE public.external_contacts RENAME TO bb_external_contacts;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='integration_webhook_events') THEN
    ALTER TABLE public.integration_webhook_events RENAME TO bb_integration_webhook_events;
  END IF;

END $$;
