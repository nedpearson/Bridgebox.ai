-- ─────────────────────────────────────────────────────────────────────────────
-- BRIDGEBOX MONETIZATION SCHEMA
-- Migration: 20260329_monetization.sql
-- Adds: credit wallets, ledger, usage events, add-on purchases,
--       service packages, service orders, feature entitlement overrides
--
-- FK MAPPING NOTES:
--   - bb_organizations = the workspace table (no separate bb_workspaces exists)
--   - bb_organization_memberships = org membership table (used for RLS)
--   - auth.users = auth user table (used for user_id FKs, consistent with voice-to-app engine)
--   - bb_profiles = extended profile table (where role column lives)
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Credit Wallets ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_credit_wallets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  balance           INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  monthly_allowance INTEGER NOT NULL DEFAULT 50,  -- -1 = unlimited (enterprise)
  lifetime_earned   INTEGER NOT NULL DEFAULT 0,
  lifetime_spent    INTEGER NOT NULL DEFAULT 0,
  period_start      DATE,
  period_end        DATE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id)
);

ALTER TABLE public.bb_credit_wallets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_wallets' AND policyname = 'wallet_member_select'
  ) THEN
    CREATE POLICY "wallet_member_select" ON public.bb_credit_wallets
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_wallets' AND policyname = 'wallet_admin_update'
  ) THEN
    CREATE POLICY "wallet_admin_update" ON public.bb_credit_wallets
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.bb_profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'internal_staff')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_wallets' AND policyname = 'wallet_service_role'
  ) THEN
    CREATE POLICY "wallet_service_role" ON public.bb_credit_wallets
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── 2. Credit Ledger ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_credit_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type        TEXT NOT NULL,
  delta             INTEGER NOT NULL,
  balance_after     INTEGER NOT NULL,
  description       TEXT NOT NULL,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_org_created
  ON public.bb_credit_ledger(organization_id, created_at DESC);

ALTER TABLE public.bb_credit_ledger ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_ledger' AND policyname = 'ledger_member_select'
  ) THEN
    CREATE POLICY "ledger_member_select" ON public.bb_credit_ledger
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_ledger' AND policyname = 'ledger_member_insert'
  ) THEN
    CREATE POLICY "ledger_member_insert" ON public.bb_credit_ledger
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_credit_ledger' AND policyname = 'ledger_service_role'
  ) THEN
    CREATE POLICY "ledger_service_role" ON public.bb_credit_ledger
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── 3. Usage Events ──────────────────────────────────────────────────────────
-- NOTE: workspace_id references bb_organizations (workspaces ARE organizations in this system)

CREATE TABLE IF NOT EXISTS public.bb_usage_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  workspace_id      UUID REFERENCES public.bb_organizations(id) ON DELETE SET NULL,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metric_type       TEXT NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  credit_cost       INTEGER NOT NULL DEFAULT 0,
  is_overage        BOOLEAN NOT NULL DEFAULT FALSE,
  metadata          JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_events_org_created
  ON public.bb_usage_events(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_events_org_type
  ON public.bb_usage_events(organization_id, metric_type);

ALTER TABLE public.bb_usage_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_usage_events' AND policyname = 'usage_events_member_select'
  ) THEN
    CREATE POLICY "usage_events_member_select" ON public.bb_usage_events
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_usage_events' AND policyname = 'usage_events_member_insert'
  ) THEN
    CREATE POLICY "usage_events_member_insert" ON public.bb_usage_events
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_usage_events' AND policyname = 'usage_events_service_role'
  ) THEN
    CREATE POLICY "usage_events_service_role" ON public.bb_usage_events
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── 4. Add-On Purchases ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_addon_purchases (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id             UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  addon_type                  TEXT NOT NULL,
  quantity                    INTEGER NOT NULL DEFAULT 1,
  unit_price                  INTEGER NOT NULL,
  total_paid                  INTEGER NOT NULL,
  stripe_payment_intent_id    TEXT,
  stripe_checkout_session_id  TEXT,
  provisioned                 BOOLEAN NOT NULL DEFAULT FALSE,
  provisioned_at              TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_addon_purchases_org
  ON public.bb_addon_purchases(organization_id, created_at DESC);

ALTER TABLE public.bb_addon_purchases ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_addon_purchases' AND policyname = 'addon_purchases_member_select'
  ) THEN
    CREATE POLICY "addon_purchases_member_select" ON public.bb_addon_purchases
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_addon_purchases' AND policyname = 'addon_purchases_service_role'
  ) THEN
    CREATE POLICY "addon_purchases_service_role" ON public.bb_addon_purchases
      FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- ─── 5. Service Packages ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_service_packages (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      TEXT NOT NULL,
  description               TEXT,
  package_type              TEXT NOT NULL,
  price_one_time            INTEGER,
  price_recurring_monthly   INTEGER,
  estimated_hours           INTEGER,
  deliverables              JSONB NOT NULL DEFAULT '[]',
  is_active                 BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.bb_service_packages (name, description, package_type, price_one_time, estimated_hours, deliverables) VALUES
  ('Premium Onboarding', 'Guided 3-session onboarding to capture your full software vision.', 'onboarding', 149900, 6, '[{"item":"Software discovery session"},{"item":"Intelligence profile setup"},{"item":"Team onboarding walkthrough"}]'),
  ('Data Migration Service', 'Full data migration from your existing systems into your new platform.', 'migration', 299900, 20, '[{"item":"Data audit and mapping"},{"item":"Migration execution"},{"item":"Post-migration validation"}]'),
  ('Workspace Setup', 'White-glove workspace configuration and intelligence profile activation.', 'setup', 99900, 4, '[{"item":"Workspace configuration"},{"item":"Team roles setup"},{"item":"Initial recording analysis"}]'),
  ('Custom Feature Sprint', 'Dedicated 2-week sprint for a specific feature or workflow module.', 'custom_sprint', 499900, 40, '[{"item":"Requirements workshop"},{"item":"Feature implementation"},{"item":"QA and delivery"}]'),
  ('Integration Setup', 'Configure and test a specific third-party integration end-to-end.', 'integration_setup', 74900, 6, '[{"item":"API configuration"},{"item":"Data mapping"},{"item":"Testing and documentation"}]'),
  ('AI Workflow Tuning', 'Optimize your workspace learning AI for maximum recommendation accuracy.', 'ai_workflow_tuning', 149900, 8, '[{"item":"Usage pattern analysis"},{"item":"Prompt tuning"},{"item":"Confidence score improvement"}]')
ON CONFLICT DO NOTHING;

ALTER TABLE public.bb_service_packages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_service_packages' AND policyname = 'service_packages_authenticated_select'
  ) THEN
    CREATE POLICY "service_packages_authenticated_select" ON public.bb_service_packages
      FOR SELECT USING (is_active = TRUE AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_service_packages' AND policyname = 'service_packages_admin_all'
  ) THEN
    CREATE POLICY "service_packages_admin_all" ON public.bb_service_packages
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.bb_profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'internal_staff')
        )
      );
  END IF;
END $$;

-- ─── 6. Service Orders ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_service_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  package_id        UUID REFERENCES public.bb_service_packages(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'proposed'
                    CHECK (status IN ('proposed','approved','in_progress','completed','cancelled')),
  assigned_to       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes             TEXT,
  one_time_charge   INTEGER,
  recurring_charge  INTEGER,
  upsell_opportunity TEXT,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_orders_org
  ON public.bb_service_orders(organization_id, created_at DESC);

ALTER TABLE public.bb_service_orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_service_orders' AND policyname = 'service_orders_org_admin_select'
  ) THEN
    CREATE POLICY "service_orders_org_admin_select" ON public.bb_service_orders
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          JOIN public.bb_profiles p ON p.id = m.user_id
          WHERE m.user_id = (SELECT auth.uid()) 
            AND m.organization_id = organization_id
            AND p.role IN ('client_admin', 'super_admin', 'internal_staff')
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_service_orders' AND policyname = 'service_orders_staff_all'
  ) THEN
    CREATE POLICY "service_orders_staff_all" ON public.bb_service_orders
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.bb_profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'internal_staff')
        )
      );
  END IF;
END $$;

-- ─── 7. Feature Entitlement Overrides ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.bb_feature_entitlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
  feature_key       TEXT NOT NULL,
  granted           BOOLEAN NOT NULL DEFAULT TRUE,
  granted_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason            TEXT,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, feature_key)
);

ALTER TABLE public.bb_feature_entitlements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_feature_entitlements' AND policyname = 'feature_entitlements_member_select'
  ) THEN
    CREATE POLICY "feature_entitlements_member_select" ON public.bb_feature_entitlements
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.bb_organization_memberships m
          WHERE m.user_id = (SELECT auth.uid()) AND m.organization_id = organization_id
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bb_feature_entitlements' AND policyname = 'feature_entitlements_admin_all'
  ) THEN
    CREATE POLICY "feature_entitlements_admin_all" ON public.bb_feature_entitlements
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.bb_profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'internal_staff')
        )
      );
  END IF;
END $$;

-- ─── Triggers: updated_at ─────────────────────────────────────────────────────
-- Note: update_updated_at_column() function is already defined by the voice-to-app migration.
-- We use CREATE OR REPLACE to be safe.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_credit_wallets_updated_at') THEN
    CREATE TRIGGER set_credit_wallets_updated_at
      BEFORE UPDATE ON public.bb_credit_wallets
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_service_orders_updated_at') THEN
    CREATE TRIGGER set_service_orders_updated_at
      BEFORE UPDATE ON public.bb_service_orders
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_service_packages_updated_at') THEN
    CREATE TRIGGER set_service_packages_updated_at
      BEFORE UPDATE ON public.bb_service_packages
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
