-- Enable the pg_stat_statements extension to allow autonomous edge nodes
-- to track query execution times securely natively over the tenant cluster.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- We also need a secure Postgres function the Edge Node can invoke
-- to safely retrieve the top 5 slowest queries.
CREATE OR REPLACE FUNCTION get_slowest_queries(limit_val INT DEFAULT 5)
RETURNS TABLE (
    queryi TEXT,
    calls BIGINT,
    mean_exec_time DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query::TEXT,
        calls,
        mean_exec_time
    FROM pg_stat_statements
    WHERE calls > 10
    ORDER BY mean_exec_time DESC
    LIMIT limit_val;
END;
$$;

-- Schedule the Self-Healing DB Agent to mathematically trace poor performance nodes
-- Runs every day at 3:00 AM UTC autonomously using existing pg_net capabilities
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') AND 
     EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
     
    PERFORM cron.unschedule('invoke_self_healing_agent');
    
    PERFORM cron.schedule(
      'invoke_self_healing_agent',
      '0 3 * * *',
      $cron$
        SELECT net.http_post(
            url:='https://your-project-ref.supabase.co/functions/v1/self-healing-agent',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
            body:='{}'::jsonb
        );
      $cron$
    );
     
  END IF;
END
$$;
