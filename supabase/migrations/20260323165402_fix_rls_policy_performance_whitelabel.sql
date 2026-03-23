/*
  # Fix RLS Policy Performance - White Label

  1. Performance Optimization
    - Wrap auth.uid() calls with SELECT for white-label policies
    
  2. Tables Updated
    - organization_branding (3 policies)
    - organization_feature_flags (2 policies)
    - custom_roles (2 policies)
    - plan_features (1 policy)
*/

-- Organization branding policies
DROP POLICY IF EXISTS "Organization members can view branding" ON public.organization_branding;
CREATE POLICY "Organization members can view branding"
  ON public.organization_branding
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_branding.organization_id
    )
  );

DROP POLICY IF EXISTS "Super admins can insert branding" ON public.organization_branding;
CREATE POLICY "Super admins can insert branding"
  ON public.organization_branding
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can update branding" ON public.organization_branding;
CREATE POLICY "Super admins can update branding"
  ON public.organization_branding
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_branding.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  );

-- Organization feature flags policies
DROP POLICY IF EXISTS "Organization members can view feature flags" ON public.organization_feature_flags;
CREATE POLICY "Organization members can view feature flags"
  ON public.organization_feature_flags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_feature_flags.organization_id
    )
  );

DROP POLICY IF EXISTS "Super admins can manage feature flags" ON public.organization_feature_flags;
CREATE POLICY "Super admins can manage feature flags"
  ON public.organization_feature_flags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = organization_feature_flags.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  );

-- Custom roles policies
DROP POLICY IF EXISTS "Organization members can view custom roles" ON public.custom_roles;
CREATE POLICY "Organization members can view custom roles"
  ON public.custom_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = custom_roles.organization_id
    )
  );

DROP POLICY IF EXISTS "Super admins can manage custom roles" ON public.custom_roles;
CREATE POLICY "Super admins can manage custom roles"
  ON public.custom_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = custom_roles.organization_id
      AND organization_memberships.role = 'super_admin'
    )
  );

-- Plan features policy
DROP POLICY IF EXISTS "Only super admins can manage plan features" ON public.plan_features;
CREATE POLICY "Only super admins can manage plan features"
  ON public.plan_features
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.role = 'super_admin'
    )
  );
