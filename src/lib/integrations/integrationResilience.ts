import { Logger } from '../logger';
import { supabase } from '../supabase';

interface RetryConfig {
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  backoffFactor?: number;
  contextName?: string;
  organizationId?: string; // If provided, terminal failures will emit a billing_alert
}

/**
 * Wraps an async integration callback with configurable exponential backoff resilience.
 * Guards Phase 6: Integration Stability
 */
export async function withIntegrationResilience<T>(
  task: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialBackoffMs = 1000,
    maxBackoffMs = 10000,
    backoffFactor = 2,
    contextName = 'External Integration Task',
    organizationId
  } = config;

  let retries = 0;
  let currentBackoff = initialBackoffMs;

  while (true) {
    try {
      return await task();
    } catch (error: any) {
      if (retries >= maxRetries) {
        Logger.error(`[Resilience Error] ${contextName} failed critically after ${maxRetries} retries.`, error);
        
        // Phase 6 Escalation: Dispatch a DB notification hook if organization is tracked
        if (organizationId) {
           await supabase.from('bb_notifications').insert({
              organization_id: organizationId,
              type: 'system_alert',
              title: 'Integration Connection Disrupted',
              message: `A sync operation for ${contextName} failed after maximum retry attempts.`,
              action_links: [{ label: 'View Integrations', url: '/portal/settings' }]
           });
        }
        
        throw error;
      }

      retries++;
      Logger.warn(`[Resilience Warn] ${contextName} choked. Retrying ${retries}/${maxRetries} in ${currentBackoff}ms.`, error);

      await new Promise(resolve => setTimeout(resolve, currentBackoff));
      currentBackoff = Math.min(currentBackoff * backoffFactor, maxBackoffMs);
    }
  }
}
