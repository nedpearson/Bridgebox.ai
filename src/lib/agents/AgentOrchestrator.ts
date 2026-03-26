import { supabase } from '../supabase';
import { ActionExecutor } from './ActionExecutor';
import { SecurityContext, ActionProposal } from './PolicyEngine';

/**
 * The Master Agent Orchestrator coordinates the active lifecycle of the AI workers.
 * It listens to webhook events or timers, packages local CRM/System context securely,
 * queries the LLM/Reasoning module, and emits an ActionProposal to the Executor.
 */
export const AgentOrchestrator = {

  /**
   * Evaluates an incoming event (e.g. "Invoice Overdue", "Lead Created")
   * Matches it against installed tenant agents, processes reasoning, and attempts to execute via ActionExecutor.
   */
  async processEvent(organizationId: string, eventType: string, payload: any) {
    console.log(`[AgentOrchestrator] Processing Event '${eventType}' for Org: ${organizationId}`);

    try {
      // 1. Find agents installed by this tenant that listen to this event category
      // In production, bb_tenant_agents would JOIN bb_agents on capability matches
      const { data: activeAgents, error } = await supabase
        .from('bb_tenant_agents')
        .select(`
          id,
          autonomy_level,
          custom_instructions,
          agent_id,
          bb_agents!inner ( name, category, capabilities_json )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active');

      if (error || !activeAgents) {
        console.error('Failed to query installed agents:', error);
        return;
      }

      // 2. Iterate and Evaluate
      for (const agent of activeAgents) {
        // Mock evaluating if this agent "cares" about the event
        const cares = await this.evaluateRelevance(agent, eventType, payload);
        if (!cares) continue;

        const context: SecurityContext = {
          organizationId,
          tenantAgentId: agent.id,
          autonomyLevel: agent.autonomy_level as any
        };

        // 3. Consult LLM/Reasoning Engine (Mocked Generation for now)
        const proposedAction = await this.reasonNextBestAction(agent, context, eventType, payload);
        
        if (!proposedAction) continue;

        // 4. Send to Action Executor
        await ActionExecutor.process(
          context,
          proposedAction.action,
          proposedAction.explanation,
          proposedAction.confidence
        );
      }

    } catch (err) {
      console.error('[AgentOrchestrator] Fatal error during event loop processing:', err);
    }
  },

  /**
   * Internal Relevance Logic
   */
  async evaluateRelevance(tenantAgent: any, eventType: string, payload: any) {
    // In production, this matches the capabilities payload inside the master bb_agents record against the event type
    // E.g. If event is `invoice.overdue` and agent is `Financial - AR Coordinator`, it cares.
    return true; 
  },

  /**
   * Bridge to the actual AI inference layer
   * Returns a structured payload determining what the agent WANTS to do
   */
  async reasonNextBestAction(tenantAgent: any, context: SecurityContext, eventType: string, payload: any) {
    // This connects to the OpenAI / Anthropic reasoning loops
    // Mocking an intended decision structure:
    
    // Simulate LLM latency
    await new Promise(r => setTimeout(r, 800));

    return {
      action: {
        actionName: 'send_invoice_reminder',
        payload: { invoiceId: payload?.invoiceId || 'unknown' },
        riskLevel: 'low' as const
      },
      explanation: 'Invoice is 3 days past due and no prior reminder has been sent this week.',
      confidence: 0.94
    };
  }

};
