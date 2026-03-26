-- Migration: Enterprise Integration Engine Automations
-- Description: Secures integration connections and establishes pg_cron schedules for background sync loops.

-- 1. Vault Secret Mapping
-- We map the vault UUID instead of raw auth_state JSON for high-security tenants.
ALTER TABLE public.bb_integration_connections 
ADD COLUMN IF NOT EXISTS vault_secret_id UUID;

-- 2. Cron Function to Process Pending Sync Jobs
-- This function will be executed by pg_cron every 5 minutes to sweep and execute mapped jobs.
CREATE OR REPLACE FUNCTION public.process_pending_integration_syncs()
RETURNS void AS $$
DECLARE
    job_record RECORD;
BEGIN
    FOR job_record IN 
        SELECT id, connection_id FROM public.bb_integration_sync_jobs 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT 10
    LOOP
        -- Mark as running to avoid race conditions
        UPDATE public.bb_integration_sync_jobs 
        SET status = 'running', started_at = now() 
        WHERE id = job_record.id;
        
        -- Logic to fire an HTTP request to Edge Functions or remote runner would go here
        -- using extensions like pg_net:
        -- SELECT * FROM net.http_post(
        --      url := 'https://[PROJECT_REF].functions.supabase.co/sync-worker',
        --      body := ('{"job_id": "' || job_record.id || '"}')::jsonb
        -- );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Schedule the Cron Job (Requires pg_cron to be active)
-- We gracefully attempt to schedule it if the extension exists.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        -- Schedule every 5 minutes
        PERFORM cron.schedule(
            'process_integration_sync_jobs',
            '*/5 * * * *',
            'SELECT public.process_pending_integration_syncs()'
        );
    END IF;
END $$;
