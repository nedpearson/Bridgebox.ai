/*
  # Fix RLS Performance Issues - Part 1

  Optimizes RLS policies for:
  - projects, project_milestones
  - subscriptions, invoices, integrations
  - invitations, onboarding_responses, leads

  Wraps auth.uid() in SELECT subqueries for per-query caching.
*/

-- ============================================================================
-- PROJECTS & RELATED
-- ============================================================================

DROP POLICY IF EXISTS "Clients can read their projects" ON public.projects;
CREATE POLICY "Clients can read their projects"
  ON public.projects FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = projects.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage all projects" ON public.projects;
CREATE POLICY "Internal staff can manage all projects"
  ON public.projects FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can read milestones" ON public.project_milestones;
CREATE POLICY "Users can read milestones"
  ON public.project_milestones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.organization_memberships ON organization_memberships.organization_id = projects.organization_id
      WHERE projects.id = project_milestones.project_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS & INVOICES
-- ============================================================================

DROP POLICY IF EXISTS "Clients read their subscriptions" ON public.subscriptions;
CREATE POLICY "Clients read their subscriptions"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = subscriptions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff manage subscriptions" ON public.subscriptions;
CREATE POLICY "Internal staff manage subscriptions"
  ON public.subscriptions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Clients read their invoices" ON public.invoices;
CREATE POLICY "Clients read their invoices"
  ON public.invoices FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = invoices.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff manage invoices" ON public.invoices;
CREATE POLICY "Internal staff manage invoices"
  ON public.invoices FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Clients read their integrations" ON public.integrations;
CREATE POLICY "Clients read their integrations"
  ON public.integrations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = integrations.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff manage integrations" ON public.integrations;
CREATE POLICY "Internal staff manage integrations"
  ON public.integrations FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- INVITATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own invitations" ON public.invitations;
CREATE POLICY "Users can view own invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (email = (SELECT auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Org admins can view org invitations" ON public.invitations;
CREATE POLICY "Org admins can view org invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      JOIN public.profiles ON profiles.id = organization_memberships.user_id
      WHERE organization_memberships.organization_id = invitations.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

DROP POLICY IF EXISTS "Internal staff can view all invitations" ON public.invitations;
CREATE POLICY "Internal staff can view all invitations"
  ON public.invitations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Org admins can create invitations" ON public.invitations;
CREATE POLICY "Org admins can create invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      JOIN public.profiles ON profiles.id = organization_memberships.user_id
      WHERE organization_memberships.organization_id = invitations.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

DROP POLICY IF EXISTS "Internal staff can create invitations" ON public.invitations;
CREATE POLICY "Internal staff can create invitations"
  ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Org admins can update org invitations" ON public.invitations;
CREATE POLICY "Org admins can update org invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      JOIN public.profiles ON profiles.id = organization_memberships.user_id
      WHERE organization_memberships.organization_id = invitations.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      JOIN public.profiles ON profiles.id = organization_memberships.user_id
      WHERE organization_memberships.organization_id = invitations.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff', 'client_admin')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update all invitations" ON public.invitations;
CREATE POLICY "Internal staff can update all invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can accept own invitations" ON public.invitations;
CREATE POLICY "Users can accept own invitations"
  ON public.invitations FOR UPDATE TO authenticated
  USING (email = (SELECT auth.jwt()->>'email'))
  WITH CHECK (email = (SELECT auth.jwt()->>'email'));

-- ============================================================================
-- ONBOARDING
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own organization onboarding" ON public.onboarding_responses;
CREATE POLICY "Users can view own organization onboarding"
  ON public.onboarding_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = onboarding_responses.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create onboarding for own organization" ON public.onboarding_responses;
CREATE POLICY "Users can create onboarding for own organization"
  ON public.onboarding_responses FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = onboarding_responses.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update own organization onboarding" ON public.onboarding_responses;
CREATE POLICY "Users can update own organization onboarding"
  ON public.onboarding_responses FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = onboarding_responses.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = onboarding_responses.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can view all onboarding" ON public.onboarding_responses;
CREATE POLICY "Internal staff can view all onboarding"
  ON public.onboarding_responses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update all onboarding" ON public.onboarding_responses;
CREATE POLICY "Internal staff can update all onboarding"
  ON public.onboarding_responses FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- LEADS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can update leads" ON public.leads;
CREATE POLICY "Internal staff can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );
