import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export interface FieldMapping {
  foreign_key: string;
  bridgebox_column: string;
  transformation?: 'string' | 'number' | 'date' | 'boolean' | 'none';
}

export interface IntegrationPlan {
  provider_name: string;
  target_table: 'global_tasks' | 'projects' | 'leads' | 'documents';
  mappings: FieldMapping[];
  confidence_score: number;
}

export const IntegrationPlannerAgent = {
  /**
   * Maps foreign unstructured JSON payloads to explicit Bridgebox table schemas
   * natively dictating how variables transfer without manual dragging-and-dropping.
   */
  async generateMappingPlan(payload: AgentPayload) {
    return AgentRegistry.execute<IntegrationPlan>('IntegrationPlannerAgent', payload, async () => {
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) throw new Error("AI Provider unavailable.");

      const prompt = `
You are the Bridgebox Integration Planner Agent. We have received a foreign webhook payload structure.
Payload Keys / Sample:
"${payload.intent}"
Context Data: ${JSON.stringify(payload.context || {})}

Output a strict JSON mapping connecting this payload to Bridgebox.
Output exactly this JSON:
{
  "provider_name": "The source app name if guessable",
  "target_table": "global_tasks|projects|leads|documents",
  "mappings": [
    {
      "foreign_key": "e.g. customer_email",
      "bridgebox_column": "e.g. email or description",
      "transformation": "string|number|date|boolean|none"
    }
  ],
  "confidence_score": 95
}
      `.trim();

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are a precise data normalization engineer outputting rigid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        ...({ responseFormat: "json_object" } as any)
      });

      if (!response.content) throw new Error("Empty AI Response");
      return JSON.parse(response.content) as IntegrationPlan;
    });
  }
};
