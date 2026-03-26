-- Migration: Enterprise Mobile App Architecture
-- Description: Establishes push notification infrastructure, device token tracking, and offline synchronization queues for native apps and PWAs.

-- 1. Mobile Devices (Push Tokens & Auth Mapping)
CREATE TABLE IF NOT EXISTS public.bb_mobile_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_token TEXT NOT NULL, -- FCM/APNs token for push notifications
    platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
    app_type TEXT NOT NULL CHECK (app_type IN ('staff', 'customer')),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, device_token)
);

-- Optimization Index
CREATE INDEX IF NOT EXISTS idx_mobile_devices_org_user ON public.bb_mobile_devices(organization_id, user_id);

-- 2. Notification Events (Aggregated Multi-channel delivery bus)
CREATE TABLE IF NOT EXISTS public.bb_notification_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('push', 'sms', 'email', 'in_app')),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed')),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimization Index
CREATE INDEX IF NOT EXISTS idx_notification_events_delivery ON public.bb_notification_events(organization_id, user_id, status);

-- 3. Offline Sync Queue (Mutation reconciliation cache)
CREATE TABLE IF NOT EXISTS public.bb_offline_sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mobile_device_id UUID REFERENCES public.bb_mobile_devices(id) ON DELETE SET NULL,
    mutation_type TEXT NOT NULL CHECK (mutation_type IN ('insert', 'update', 'delete', 'rpc')),
    target_table TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'conflict', 'failed')),
    conflict_resolution_strategy TEXT DEFAULT 'client_wins' CHECK (conflict_resolution_strategy IN ('client_wins', 'server_wins', 'manual')),
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_offline_queue_processing ON public.bb_offline_sync_queue(organization_id, status, created_at);


-- ENABLE RLS
ALTER TABLE public.bb_mobile_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bb_offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "Users can manage their own devices"
    ON public.bb_mobile_devices FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their notifications"
    ON public.bb_notification_events FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can sync their offline mutated records"
    ON public.bb_offline_sync_queue FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
