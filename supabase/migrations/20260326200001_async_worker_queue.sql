-- Migration: Background Worker Queues
-- Description: Unblocks the UI by migrating heavy document extractions and workflow logic to an asynchronous Postgres queue.

CREATE TABLE IF NOT EXISTS public.bb_async_worker_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.bb_organizations(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL CHECK (job_type IN ('document_extraction', 'ai_generation', 'bulk_import', 'workflow_runner')),
    payload JSONB DEFAULT '{}'::jsonb,
    priority INTEGER DEFAULT 0, -- Higher number executes first
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'dead_letter')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_log TEXT,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by TEXT, -- Worker node ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Optimization Indexes for High-Frequency Queue Polling
CREATE INDEX IF NOT EXISTS idx_worker_queue_polling 
ON public.bb_async_worker_queue(status, priority DESC, created_at ASC) 
WHERE status = 'queued';

CREATE INDEX IF NOT EXISTS idx_worker_queue_org
ON public.bb_async_worker_queue(organization_id, status);

-- Enable RLS
ALTER TABLE public.bb_async_worker_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own async jobs"
    ON public.bb_async_worker_queue FOR SELECT
    TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id FROM bb_organization_memberships
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Internal service roles can map and lock async jobs"
    ON public.bb_async_worker_queue FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
