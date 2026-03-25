-- Enable pg_cron and pg_net extensions if available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create the background cron job to execute the Tenant Data Quality Agent
-- This runs every day at 2:00 AM UTC
DO $$
BEGIN
  -- We use a DO block to gracefully handle environments where pg_cron might not be fully elevated
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND 
     EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
     
    -- Deschedule existing if any to prevent duplicates during replays
    PERFORM cron.unschedule('invoke_tenant_data_quality_agent');
    
    -- Schedule the nocturnal sweep mapping the configured edge url natively
    PERFORM cron.schedule(
      'invoke_tenant_data_quality_agent',
      '0 2 * * *',
      $$
        SELECT net.http_post(
            url:='https://your-project-ref.supabase.co/functions/v1/tenant-data-quality-agent',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        );
      $$
    );
     
  END IF;
END
$$;
