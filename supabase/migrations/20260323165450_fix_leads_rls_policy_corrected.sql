/*
  # Fix Leads Table RLS Policy

  1. Security Fix
    - Remove policy that allows unrestricted INSERT access
    - Add proper validation for lead submissions
    
  2. New Policy
    - Allows anonymous lead submissions but with basic validation
    - Requires email, name, and valid organization_id
    - Prevents abuse while maintaining public lead capture
*/

-- Drop the insecure policy
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.leads;

-- Create a secure policy for lead submissions
CREATE POLICY "Validated lead submissions"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Ensure required fields are present
    email IS NOT NULL 
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND name IS NOT NULL
    AND length(trim(name)) >= 2
    AND organization_id IS NOT NULL
    -- Status must be 'new' for submissions
    AND status = 'new'
  );

-- Ensure authenticated users can view their organization's leads
DROP POLICY IF EXISTS "Users can view organization leads" ON public.leads;
CREATE POLICY "Users can view organization leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = leads.organization_id
    )
  );

-- Ensure internal staff can manage leads
DROP POLICY IF EXISTS "Internal staff can manage leads" ON public.leads;
CREATE POLICY "Internal staff can manage leads"
  ON public.leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships
      WHERE organization_memberships.user_id = (SELECT auth.uid())
      AND organization_memberships.organization_id = leads.organization_id
      AND organization_memberships.role IN ('super_admin', 'internal_staff')
    )
  );
