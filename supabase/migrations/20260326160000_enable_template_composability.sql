-- Migration: Enable Enterprise Template Composability
-- Description: Adds dependency mapping tables and merge strategies for Template OS

-- Add composability properties to bb_templates
ALTER TABLE public.bb_templates 
ADD COLUMN IF NOT EXISTS is_overlay BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS merge_strategy TEXT DEFAULT 'skip_existing' CHECK (merge_strategy IN ('skip_existing', 'overwrite', 'merge_fields'));

-- Create the specific dependency junction table
CREATE TABLE IF NOT EXISTS public.bb_template_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES public.bb_templates(id) ON DELETE CASCADE,
    depends_on_template_id UUID NOT NULL REFERENCES public.bb_templates(id) ON DELETE CASCADE,
    version_requirement TEXT DEFAULT '*',
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(template_id, depends_on_template_id)
);

-- Enable RLS
ALTER TABLE public.bb_template_dependencies ENABLE ROW LEVEL SECURITY;

-- Policies for bb_template_dependencies
CREATE POLICY "Template dependencies are viewable by all authenticated users"
    ON public.bb_template_dependencies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Super admins can manage template dependencies"
    ON public.bb_template_dependencies FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM bb_organization_memberships m
            WHERE m.user_id = auth.uid()
            AND m.role = 'super_admin'
        )
    );
