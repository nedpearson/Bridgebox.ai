-- Chatwoot Integration Tables

CREATE TABLE IF NOT EXISTS public.external_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  inbox_id text NOT NULL,
  contact_id text NOT NULL,
  assignee_id text,
  status text NOT NULL,
  subject text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  conversation_id text NOT NULL,
  sender_type text,
  sender_id text,
  message_type text,
  content text,
  content_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  name text,
  email text,
  phone_number text,
  avatar_url text,
  identifier text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_inboxes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  name text,
  channel_type text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  name text,
  email text,
  role text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, external_id)
);

CREATE TABLE IF NOT EXISTS public.external_conversation_labels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  conversation_id text NOT NULL,
  label_name text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, provider, conversation_id, label_name)
);

CREATE TABLE IF NOT EXISTS public.external_conversation_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  external_id text NOT NULL,
  provider text NOT NULL,
  conversation_id text NOT NULL,
  event_type text,
  event_data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.integration_webhook_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider text NOT NULL,
  event_type text,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.external_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_conversations" ON public.external_conversations FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_messages" ON public.external_messages FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_contacts" ON public.external_contacts FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_inboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_inboxes" ON public.external_inboxes FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_agents" ON public.external_agents FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_conversation_labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_conversation_labels" ON public.external_conversation_labels FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.external_conversation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own external_conversation_events" ON public.external_conversation_events FOR ALL USING (organization_id IN (SELECT auth.uid()));

ALTER TABLE public.integration_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own integration_webhook_events" ON public.integration_webhook_events FOR ALL USING (organization_id IN (SELECT auth.uid()));

-- Settings UI DB Seeding (Equivalent to Phase 4)
INSERT INTO connector_providers (
  id, name, display_name, description, connector_type, category, auth_type, features, is_popular, status
) VALUES (
  'chatwoot', 'Chatwoot', 'Chatwoot', 
  'Conversations, messages, and omnichannel support sync', 
  'api', 'communication', 'api_key', ARRAY['read_sync', 'webhook'], true, 'beta'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, features = EXCLUDED.features;
