-- Create Webhook Payload Isolation Table
CREATE TABLE public.integration_webhooks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    source text NOT NULL CHECK (source IN ('zapier', 'make', 'custom', 'api')),
    event_type text,
    raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
    mapped_entity_type text,
    mapped_entity_payload jsonb,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'failed', 'processing')),
    error_log text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes for scaling
CREATE INDEX idx_integration_webhooks_org ON public.integration_webhooks(organization_id);
CREATE INDEX idx_integration_webhooks_status ON public.integration_webhooks(status);
CREATE INDEX idx_integration_webhooks_source ON public.integration_webhooks(source);

-- Enable RLS
ALTER TABLE public.integration_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view webhooks in their organization"
    ON public.integration_webhooks FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert webhooks in their organization"
    ON public.integration_webhooks FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update webhooks in their organization"
    ON public.integration_webhooks FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()
    ));

-- Add trigger for updated_at
CREATE TRIGGER update_integration_webhooks_updated_at
    BEFORE UPDATE ON public.integration_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
