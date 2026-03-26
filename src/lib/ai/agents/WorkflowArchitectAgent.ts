import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export interface WorkflowRule {
  trigger_entity: string;
  trigger_event: 'created' | 'updated' | 'deleted' | 'status_changed';
  action_type: 'create_task' | 'send_email' | 'update_record' | 'webhook';
  action_payload: Record<string, any>;
  description: string;
}

export const WorkflowArchitectAgent = {
  /**
   * Converts a natural language workflow request (e.g. "When a deal closes, email the team")
   * into an array of strict trigger/action JSON configurations.
   */
  async generateRules(payload: AgentPayload) {
    return AgentRegistry.execute<{ workflows: WorkflowRule[] }>('WorkflowArchitectAgent', payload, async () => {
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) throw new Error("AI Provider unavailable.");

      const prompt = `
You are the Bridgebox Workflow Architect. Convert the following operational logic into explicit platform trigger-action rules.
Business Logic: "${payload.intent}"
Context Data: ${JSON.stringify(payload.context || {})}

Output strict JSON:
{
  "workflows": [
    {
      "trigger_entity": "projects|tasks|leads|documents",
      "trigger_event": "created|updated|deleted|status_changed",
      "action_type": "create_task|send_email|update_record|webhook",
      "action_payload": {}, // Mock the expected payload structure
      "description": "Short explanation of this exact rule constraint."
    }
  ]
}
      `.trim();

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are an explicit deterministic workflow compiler.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        ...({ responseFormat: "json_object" } as any)
      });

      if (!response.content) throw new Error("Empty AI Response");
      return JSON.parse(response.content);
    });
  }
};
