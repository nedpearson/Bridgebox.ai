/*
  # Fix RLS Performance Issues - Part 3

  Optimizes RLS policies for:
  - client_health_scores, project_implementations, implementation_*
  - agent_actions, client_interactions, account_owners
  - automation_rules, automation_executions, success_opportunities, risk_flags
  
  Wraps auth.uid() in SELECT subqueries for per-query caching.
*/

-- ============================================================================
-- CLIENT SUCCESS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all health scores" ON public.client_health_scores;
CREATE POLICY "Internal staff can view all health scores"
  ON public.client_health_scores FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage health scores" ON public.client_health_scores;
CREATE POLICY "Internal staff can manage health scores"
  ON public.client_health_scores FOR ALL TO authenticated
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
-- IMPLEMENTATIONS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can manage all implementations" ON public.project_implementations;
CREATE POLICY "Internal staff can manage all implementations"
  ON public.project_implementations FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Clients can view their implementations" ON public.project_implementations;
CREATE POLICY "Clients can view their implementations"
  ON public.project_implementations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.organization_memberships ON organization_memberships.organization_id = projects.organization_id
      WHERE projects.id = project_implementations.project_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage all checklists" ON public.implementation_checklists;
CREATE POLICY "Internal staff can manage all checklists"
  ON public.implementation_checklists FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Clients can view their checklists" ON public.implementation_checklists;
CREATE POLICY "Clients can view their checklists"
  ON public.implementation_checklists FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_implementations
      JOIN public.projects ON projects.id = project_implementations.project_id
      JOIN public.organization_memberships ON organization_memberships.organization_id = projects.organization_id
      WHERE project_implementations.id = implementation_checklists.implementation_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage all environments" ON public.implementation_environments;
CREATE POLICY "Internal staff can manage all environments"
  ON public.implementation_environments FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Clients can view their environments" ON public.implementation_environments;
CREATE POLICY "Clients can view their environments"
  ON public.implementation_environments FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_implementations
      JOIN public.projects ON projects.id = project_implementations.project_id
      JOIN public.organization_memberships ON organization_memberships.organization_id = projects.organization_id
      WHERE project_implementations.id = implementation_environments.implementation_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage all risks" ON public.implementation_risks;
CREATE POLICY "Internal staff can manage all risks"
  ON public.implementation_risks FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Clients can view their risks" ON public.implementation_risks;
CREATE POLICY "Clients can view their risks"
  ON public.implementation_risks FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.project_implementations
      JOIN public.projects ON projects.id = project_implementations.project_id
      JOIN public.organization_memberships ON organization_memberships.organization_id = projects.organization_id
      WHERE project_implementations.id = implementation_risks.implementation_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- AGENT ACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Users can view actions in their organization" ON public.agent_actions;
CREATE POLICY "Users can view actions in their organization"
  ON public.agent_actions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = agent_actions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can create actions" ON public.agent_actions;
CREATE POLICY "Internal staff can create actions"
  ON public.agent_actions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can update actions in their organization" ON public.agent_actions;
CREATE POLICY "Users can update actions in their organization"
  ON public.agent_actions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = agent_actions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.organization_id = agent_actions.organization_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Internal staff can delete actions" ON public.agent_actions;
CREATE POLICY "Internal staff can delete actions"
  ON public.agent_actions FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

-- ============================================================================
-- CLIENT INTERACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all interactions" ON public.client_interactions;
CREATE POLICY "Internal staff can view all interactions"
  ON public.client_interactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Users can view interactions they conducted" ON public.client_interactions;
CREATE POLICY "Users can view interactions they conducted"
  ON public.client_interactions FOR SELECT TO authenticated
  USING (conducted_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Internal staff can insert interactions" ON public.client_interactions;
CREATE POLICY "Internal staff can insert interactions"
  ON public.client_interactions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update interactions" ON public.client_interactions;
CREATE POLICY "Internal staff can update interactions"
  ON public.client_interactions FOR UPDATE TO authenticated
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
-- ACCOUNT OWNERS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all account owners" ON public.account_owners;
CREATE POLICY "Internal staff can view all account owners"
  ON public.account_owners FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Super admin can manage account owners" ON public.account_owners;
CREATE POLICY "Super admin can manage account owners"
  ON public.account_owners FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- ============================================================================
-- AUTOMATION
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view automation rules" ON public.automation_rules;
CREATE POLICY "Internal staff can view automation rules"
  ON public.automation_rules FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage automation rules" ON public.automation_rules;
CREATE POLICY "Internal staff can manage automation rules"
  ON public.automation_rules FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Internal staff can view automation executions" ON public.automation_executions;
CREATE POLICY "Internal staff can view automation executions"
  ON public.automation_executions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can insert automation executions" ON public.automation_executions;
CREATE POLICY "Internal staff can insert automation executions"
  ON public.automation_executions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can update automation executions" ON public.automation_executions;
CREATE POLICY "Internal staff can update automation executions"
  ON public.automation_executions FOR UPDATE TO authenticated
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
-- SUCCESS OPPORTUNITIES & RISK FLAGS
-- ============================================================================

DROP POLICY IF EXISTS "Internal staff can view all opportunities" ON public.success_opportunities;
CREATE POLICY "Internal staff can view all opportunities"
  ON public.success_opportunities FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage opportunities" ON public.success_opportunities;
CREATE POLICY "Internal staff can manage opportunities"
  ON public.success_opportunities FOR ALL TO authenticated
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

DROP POLICY IF EXISTS "Internal staff can view all risk flags" ON public.risk_flags;
CREATE POLICY "Internal staff can view all risk flags"
  ON public.risk_flags FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Internal staff can manage risk flags" ON public.risk_flags;
CREATE POLICY "Internal staff can manage risk flags"
  ON public.risk_flags FOR ALL TO authenticated
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
