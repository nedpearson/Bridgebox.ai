-- Bridgebox Platform Schema Fix
-- Run this in your Supabase SQL Editor to allow new users to create organizations during onboarding.

-- Allow authenticated users to create organizations
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations 
FOR INSERT TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to create their own membership links when creating an organization
DROP POLICY IF EXISTS "Users can create their own memberships" ON organization_memberships;
CREATE POLICY "Users can create their own memberships" ON organization_memberships 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Optional: Allow users to update the organizations they are an admin of
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
CREATE POLICY "Admins can update their organizations" ON organizations 
FOR UPDATE TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM organization_memberships 
    WHERE organization_memberships.organization_id = organizations.id 
    AND organization_memberships.user_id = auth.uid() 
    AND organization_memberships.role = 'client_admin'
  )
);
