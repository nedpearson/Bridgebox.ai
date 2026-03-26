import { supabase } from '../supabase';
import { PolicyEngine, ActionProposal, SecurityContext } from './PolicyEngine';

export const ActionExecutor = {

  /**
   * The single entry point for all Agent actions.
   * Based on the autonomy level, this either logs the action as DRAFT for the Inbox, or EXECUTES it directly.
   */
  async process(context: SecurityContext, action: ActionProposal, reason: string, confidence: number) {
    
    const startTime = performance.now();

    try {
      // 1. Policy Gate
      const check = await PolicyEngine.evaluate(context, action);

      if (!check.allowed) {
        // Log the failure to the Audit Trail so admins can see when agents break boundaries
        await this.logAudit(context, action, 'blocked_by_policy', check.reason || 'Policy Engine Block');
        throw new Error(`Agent action rejected by Policy Engine: ${check.reason}`);
      }

      // 2. Autonomy Evaluation
      // Level 0: Insights only. Never acts, never drafts.
      if (context.autonomyLevel === 'level_0') {
         throw new Error(`Agent is restricted to Level 0 (Insights Only). Cannot propose or execute actions.`);
      }

      // 3. Routing Layer
      if (context.autonomyLevel === 'level_1' || action.riskLevel === 'high' || action.riskLevel === 'critical') {
        // Level 1: Drafts Only. OR it's a high risk action that Level 2 cannot auto-run.
        // Route to the UX Inbox for Human Approval
        const { data, error } = await supabase.from('bb_agent_actions_queue').insert({
           organization_id: context.organizationId,
           tenant_agent_id: context.tenantAgentId,
           proposed_action: action.actionName,
           payload: action.payload,
           explanation: reason,
           confidence_score: confidence,
           risk_level: action.riskLevel,
           status: 'pending' // Awaiting human in the loop
        }).select('id').single();

        if (error) throw error;
        
        await this.logAudit(context, action, 'drafted_for_review', `Drafted action ${action.actionName} due to Autonomy Level 1 / Risk Policy`, data.id);
        return { status: 'drafted', queueId: data.id };
      }

      // Level 2 / Level 3 executing safe logic
      // Note: In Level 3, the Policy Engine check above already verified if the specific action is allowed to run autonomously.
      return await this.executePayload(context, action, startTime, reason);

    } catch (err: any) {
      console.error('Action execution failed:', err);
      return { status: 'failed', error: err.message };
    }
  },

  /**
   * Internal execution for approved payloads (or Level 3 autonomous payloads)
   */
  async executePayload(context: SecurityContext, action: ActionProposal, startTime: number, explanation: string, queueId?: string) {
    try {
      // Perform the actual action.
      // E.g. Calling the internal API routers based on `action.actionName`.
      // Implementation Mock:
      console.log(`[Autonomy Exec] Running ${action.actionName} for Org: ${context.organizationId}`);
      
      // We simulate a network call matching the payload
      const executionResult = { success: true, timestamp: Date.now() }; 

      // If this was an approved Inbox item, mark it executed
      if (queueId) {
         await supabase.from('bb_agent_actions_queue')
           .update({ status: 'executed', updated_at: new Date().toISOString() })
           .eq('id', queueId);
      }

      const duration = Math.round(performance.now() - startTime);

      await this.logAudit(context, action, 'executed', explanation, queueId, duration);

      return { status: 'executed', result: executionResult, durationMs: duration };

    } catch (err: any) {
      // If it fails mid-execution
      if (queueId) {
         await supabase.from('bb_agent_actions_queue').update({ status: 'failed' }).eq('id', queueId);
      }
      await this.logAudit(context, action, 'failed', err.message, queueId);
      throw err;
    }
  },

  /**
   * Safe Audit Logging
   */
  async logAudit(context: SecurityContext, action: ActionProposal, eventType: string, details: string, queueId?: string, duration?: number) {
     await supabase.from('bb_agent_audit_logs').insert({
        organization_id: context.organizationId,
        tenant_agent_id: context.tenantAgentId,
        action_queue_id: queueId,
        event_type: eventType,
        details: { actionName: action.actionName, message: details, payload: action.payload },
        execution_time_ms: duration
     });
  }
};
