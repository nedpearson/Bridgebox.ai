import { supabase } from '../supabase';

export type SecurityContext = {
  organizationId: string;
  tenantAgentId: string;
  autonomyLevel: 'level_0' | 'level_1' | 'level_2' | 'level_3';
};

export type ActionProposal = {
  actionName: string;
  payload: any;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
};

/**
 * The PolicyEngine enforces hard-coded bounds preventing agents from 
 * deleting production data, sending unapproved external comms, or entering infinite loops.
 */
export const PolicyEngine = {
  
  // Hardcoded Denylist of operations an agent can never do without human SuperAdmin override
  BANNED_OPERATIONS: [
    'delete_organization',
    'delete_billing_subscription',
    'export_all_client_data',
    'modify_rls_policies',
    'grant_super_admin'
  ],

  // Operations that are inherently High Risk and clamp to Level 1 (Human Approval) automatically
  HIGH_RISK_OPERATIONS: [
    'send_bulk_external_email',
    'process_external_refund',
    'modify_invoice_amount',
    'delete_workflow_template'
  ],

  // Maximum executions per agent per tenant per hour to prevent infinite context loops
  RATE_LIMIT_PER_HOUR: 50,

  /**
   * Primary Evaluation Gate
   */
  async evaluate(context: SecurityContext, action: ActionProposal): Promise<{ allowed: boolean; reason?: string }> {
    
    // 1. Absolute Denylist Check
    if (this.BANNED_OPERATIONS.includes(action.actionName)) {
      return { allowed: false, reason: `Action '${action.actionName}' is absolutely prohibited by System Policy.` };
    }

    // 2. High Risk Escalation Check
    // If the action is High Risk, the agent MUST be at least Level 3, OR the action must be forced down to Level 1.
    // (This ensures Level 2 agents cannot process refunds automatically)
    if (this.HIGH_RISK_OPERATIONS.includes(action.actionName) || action.riskLevel === 'critical') {
      if (context.autonomyLevel !== 'level_3') {
        return { allowed: false, reason: `Action '${action.actionName}' is High Risk. Requires Level 3 Autonomy (Current: ${context.autonomyLevel}). Must be drafted for human review.` };
      }
    }

    // 3. Rate Limit / Loop Prevention
    // Check how many actions this agent executed in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count, error } = await supabase
      .from('bb_agent_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', context.organizationId)
      .eq('tenant_agent_id', context.tenantAgentId)
      .gte('created_at', oneHourAgo);

    if (error) {
      console.error('Policy Engine failed to verify rate limits', error);
      return { allowed: false, reason: 'Failed to securely verify agent operation rate limits.' };
    }

    if (count !== null && count >= this.RATE_LIMIT_PER_HOUR) {
      return { allowed: false, reason: `Agent has exceeded the strict Execution Rate Limit of ${this.RATE_LIMIT_PER_HOUR}/hour.` };
    }

    // 4. Payload Malformation & Data Injection Protection
    if (JSON.stringify(action.payload).includes('<script>')) {
      return { allowed: false, reason: 'Payload rejected: XSS detection triggered.' };
    }

    // Passed all rigorous checks
    return { allowed: true };
  }
};
