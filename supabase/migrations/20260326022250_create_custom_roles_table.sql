CREATE TABLE IF NOT EXISTS public.custom_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    display_name text NOT NULL,
    description text,
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,
    inherits_from text,
    is_active boolean DEFAULT true NOT NULL,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE (organization_id, name)
);

ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view custom roles in their organization" ON public.custom_roles;
CREATE POLICY "Users can view custom roles in their organization" ON public.custom_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = custom_roles.organization_id 
            AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Super admins can manage custom roles" ON public.custom_roles;
CREATE POLICY "Super admins can manage custom roles" ON public.custom_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.organization_memberships
            WHERE organization_id = custom_roles.organization_id 
            AND user_id = auth.uid() 
            AND role = 'super_admin'::public.user_role
        )
    );
