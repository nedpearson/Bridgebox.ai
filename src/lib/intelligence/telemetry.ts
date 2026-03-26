import { supabase } from '../supabase';

export type IntelligenceEventType = 'workflow_started' | 'workflow_completed' | 'workflow_failed' | 
                                    'lead_stalled' | 'lead_won' | 'lead_lost' |
                                    'ui_interaction' | 'feature_dropoff' | 'ai_invoked' |
                                    'template_used' | 'integration_sync';

export type IntelligenceModule = 'crm' | 'delivery' | 'copilot' | 'automations' | 'settings' | 'core';

export interface TelemetryPayload {
  organization_id: string;
  user_id?: string;
  event_type: IntelligenceEventType;
  module: IntelligenceModule;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export const telemetryService = {
  /**
   * Pushes a passive interaction event into the unified layer
   */
  async track(payload: TelemetryPayload) {
    try {
      const { error } = await supabase
        .from('bb_intelligence_events')
        .insert({
          organization_id: payload.organization_id,
          user_id: payload.user_id,
          event_type: payload.event_type,
          module: payload.module,
          context: payload.context || {},
          metadata: payload.metadata || {}
        });

      if (error) throw error;
    } catch (err) {
      console.warn('Telemetry event failed (non-blocking):', err);
    }
  },

  /**
   * Utility for frontend components to log passive UI interactions
   * Use sparingly for high-value friction points, not every click.
   */
  async trackUX(orgId: string, userId: string, componentName: string, action: string, durationMs?: number) {
    return this.track({
      organization_id: orgId,
      user_id: userId,
      event_type: 'ui_interaction',
      module: 'core',
      context: { component: componentName, action },
      metadata: { durationMs }
    });
  }
};
