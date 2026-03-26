// Bridgebox Centralized Telemetry Logger
export const Logger = {
  info: (message: string, data?: any) => {
    // In production, sync to Datadog/CloudWatch
    if (import.meta.env.MODE === 'development') {
      console.info(`[INFO] ${message}`, data || '');
    } else {
      // Stub for external telemetry
      // fetch('/api/telemetry', { type: 'info', message, data })
    }
  },
  warn: (message: string, data?: any) => {
    if (import.meta.env.MODE === 'development') {
      console.warn(`[WARN] ${message}`, data || '');
    }
  },
  error: (message: string, error?: any) => {
    // In production, dispatch to Sentry / Supabase alerts securely
    if (import.meta.env.MODE === 'development') {
      console.error(`[CRITICAL] ${message}`, error || '');
    } else {
      // Trigger Supabase Edge Function to log high-severity error
      // supabase.functions.invoke('log-error', { body: { message, error } })
    }
  },
  metric: (name: string, value: number, tags?: Record<string, string>) => {
    if (import.meta.env.MODE === 'development') {
      console.debug(`[METRIC] ${name}: ${value}`, tags || '');
    }
  }
};
