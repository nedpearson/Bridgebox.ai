/*
  # Fix RLS Policy Performance - Part 5 (Corrected)

  1. Performance Optimization
    - Wrap auth.uid() calls with SELECT to prevent re-evaluation per row
    - Significantly improves query performance at scale
    
  2. Tables Updated
    - invitations (2 policies)
    - market_signal_scores (1 policy)
    - workflows (4 policies)
    - workflow_steps (2 policies)
    - workflow_executions (3 policies)
    - workflow_step_executions (2 policies)
*/

-- Invitations policies
DROP POLICY IF EXISTS "Users can accept own invitations" ON public.invitations;
CREATE POLICY "Users can accept own invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT auth.jwt()->>'email'))
  WITH CHECK (email = (SELECT auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Users can view own invitations" ON public.invitations;
CREATE POLICY "Users can view own invitations"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt()->>'email'));

-- Market signal scores
DROP POLICY IF EXISTS "System can manage signal scores" ON public.market_signal_scores;
CREATE POLICY "System can manage signal scores"
  ON public.market_signal_scores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = market_signal_scores.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

-- Workflows policies
DROP POLICY IF EXISTS "Users can view organization workflows" ON public.workflows;
CREATE POLICY "Users can view organization workflows"
  ON public.workflows
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflows.organization_id
    )
  );

DROP POLICY IF EXISTS "Admins and staff can create workflows" ON public.workflows;
CREATE POLICY "Admins and staff can create workflows"
  ON public.workflows
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Admins and staff can update workflows" ON public.workflows;
CREATE POLICY "Admins and staff can update workflows"
  ON public.workflows
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

DROP POLICY IF EXISTS "Super admins can delete workflows" ON public.workflows;
CREATE POLICY "Super admins can delete workflows"
  ON public.workflows
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflows.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  );

-- Workflow steps policies
DROP POLICY IF EXISTS "Users can view workflow steps" ON public.workflow_steps;
CREATE POLICY "Users can view workflow steps"
  ON public.workflow_steps
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows
      JOIN public.organization_memberships ON organization_memberships.organization_id = workflows.organization_id
      WHERE workflows.id = workflow_steps.workflow_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins and staff can manage workflow steps" ON public.workflow_steps;
CREATE POLICY "Admins and staff can manage workflow steps"
  ON public.workflow_steps
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows
      JOIN public.organization_memberships ON organization_memberships.organization_id = workflows.organization_id
      WHERE workflows.id = workflow_steps.workflow_id
      AND organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );

-- Workflow executions policies
DROP POLICY IF EXISTS "Users can view organization workflow executions" ON public.workflow_executions;
CREATE POLICY "Users can view organization workflow executions"
  ON public.workflow_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflow_executions.organization_id
    )
  );

DROP POLICY IF EXISTS "System can create workflow executions" ON public.workflow_executions;
CREATE POLICY "System can create workflow executions"
  ON public.workflow_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflow_executions.organization_id
    )
  );

DROP POLICY IF EXISTS "System can update workflow executions" ON public.workflow_executions;
CREATE POLICY "System can update workflow executions"
  ON public.workflow_executions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflow_executions.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = workflow_executions.organization_id
    )
  );

-- Workflow step executions policies
DROP POLICY IF EXISTS "Users can view workflow step executions" ON public.workflow_step_executions;
CREATE POLICY "Users can view workflow step executions"
  ON public.workflow_step_executions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_executions
      JOIN public.organization_memberships ON organization_memberships.organization_id = workflow_executions.organization_id
      WHERE workflow_executions.id = workflow_step_executions.workflow_execution_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can manage workflow step executions" ON public.workflow_step_executions;
CREATE POLICY "System can manage workflow step executions"
  ON public.workflow_step_executions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workflow_executions
      JOIN public.organization_memberships ON organization_memberships.organization_id = workflow_executions.organization_id
      WHERE workflow_executions.id = workflow_step_executions.workflow_execution_id
      AND organization_memberships.user_id = (SELECT auth.uid())
    )
  );
