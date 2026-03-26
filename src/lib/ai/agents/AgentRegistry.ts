import { supabase } from '../../supabase';

export interface AgentPayload {
  intent: string;
  context: any;
  organizationId?: string;
}

export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  execution_ms: number;
}

/**
 * Universal Wrapper for all Super Agents.
 * Enforces unified telemetry logging into `internal_logs` ensuring maximum observability of LLM actions.
 */
export const AgentRegistry = {
  async execute<T>(
    agentName: string, 
    payload: AgentPayload, 
    agentLogic: () => Promise<T>
  ): Promise<AgentResponse<T>> {
    const start = Date.now();
    try {
      const result = await agentLogic();
      
      // Log successful AI inference natively into the CommandCenter log
      await supabase.from('bb_internal_logs').insert([{
        severity: 'info',
        type: `Agent Execution [${agentName}]`,
        module: 'SuperAgentMatrix',
        message: `Successfully executed agent logic.`,
        metadata: { agentName, execution_time_ms: Date.now() - start, payload_preview: payload.intent.substring(0, 100) }
      }]);

      return {
        success: true,
        data: result,
        execution_ms: Date.now() - start
      };
    } catch (e: any) {
      console.error(`[AgentRegistry] ${agentName} Fault:`, e);

      // Log failure explicitly for the Support/Diagnostic Agent to catch later
      await supabase.from('bb_internal_logs').insert([{
        severity: 'error',
        type: `Agent Fault [${agentName}]`,
        module: 'SuperAgentMatrix',
        message: e?.message || 'Unknown LLM Fault',
        metadata: { agentName, payload }
      }]);

      return {
        success: false,
        error: e?.message || 'Agent fault',
        execution_ms: Date.now() - start
      };
    }
  }
};
