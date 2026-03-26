import { supabase } from '../supabase';

export interface AlertPayload {
  organization_id: string;
  user_id: string;
  type: 'info' | 'warning' | 'critical' | 'insight';
  title: string;
  message: string;
  route?: string;
  forcePush?: boolean; // If true, bypasses batching
}

export const smartNotifications = {
  /**
   * Pushes an alert into the system. Uses intelligence to determine if it should be
   * aggregated (batched) or blasted immediately to the user workspace.
   */
  async dispatch(payload: AlertPayload) {
    try {
      // 1. Critical and ForcePush skip batching
      if (payload.type === 'critical' || payload.forcePush) {
        return this._executeImmediateDelivery(payload);
      }

      // 2. Intelligent Notification Routing
      // Query if the user is currently online/active based on telemetry within last 5 minutes
      const fiveMinsAgo = new Date(Date.now() - 5 * 60000).toISOString();
      
      const { data: recentActivity } = await supabase
        .from('bb_intelligence_events')
        .select('id')
        .eq('user_id', payload.user_id)
        .gte('created_at', fiveMinsAgo)
        .limit(1);

      if (recentActivity && recentActivity.length > 0) {
        // User is currently active in the UI, show inline toast
        // In a real app, this triggers a websocket or Zustand store for toast UI
        console.log(`[SmartNotif] Inline UI delivery for active user: ${payload.title}`);
        return this._executeImmediateDelivery(payload);
      } else {
        // User is idle, queue it into the daily digest (batching to avoid email spam)
        console.log(`[SmartNotif] User idle, batching to daily digest: ${payload.title}`);
        return this._queueForDigest(payload);
      }
    } catch (err) {
      console.error('Failed to dispatch smart notification:', err);
    }
  },

  async _executeImmediateDelivery(payload: AlertPayload) {
    // Write directly to `bb_notifications` table where `read` = false
    await supabase.from('bb_notifications').insert({
      organization_id: payload.organization_id,
      user_id: payload.user_id,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      link: payload.route
    });
  },

  async _queueForDigest(payload: AlertPayload) {
     // A daily chron task would flush this special queue and bundle them into an email snippet
     // Since this is a lightweight shim, we simply insert it into the same table with a 'batched' status
     // so the UI won't spam ping but it's available in the inbox.
     await supabase.from('bb_notifications').insert({
        organization_id: payload.organization_id,
        user_id: payload.user_id,
        title: `(Batched) ${payload.title}`,
        message: payload.message,
        type: payload.type,
        link: payload.route
      });
  }
};
