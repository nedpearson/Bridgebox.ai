import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export interface TopologyNode {
  name: string;
  category: string; // e.g. "Accounting", "CRM", "Communication"
  integration_type: 'inbound_webhook' | 'outbound_api' | 'bi_directional';
  complexity: 'low' | 'medium' | 'high';
  bridgebox_target: string; // e.g. "invoices", "leads", "tasks"
}

export const StackDiscoveryAgent = {
  /**
   * Consumes a messy list of software tools and organizes them into a structured AI Topology Graph
   * outputting strict JSON determining exactly how Bridgebox needs to orchestrate them.
   */
  async mapTopology(payload: AgentPayload) {
    return AgentRegistry.execute<{ nodes: TopologyNode[] }>('StackDiscoveryAgent', payload, async () => {
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) throw new Error("AI Provider unavailable.");

      const prompt = `
You are the Bridgebox Stack Discovery Agent. The client has provided their messy tech stack:
"${payload.intent}"
Context Data: ${JSON.stringify(payload.context || {})}

Analyze these tools and output a strict JSON graph plotting how they should connect to Bridgebox natively.
Output exactly this JSON:
{
  "nodes": [
    {
      "name": "Tool Name (e.g. QuickBooks)",
      "category": "Accounting",
      "integration_type": "inbound_webhook|outbound_api|bi_directional",
      "complexity": "low|medium|high",
      "bridgebox_target": "invoices|leads|tasks|documents|projects"
    }
  ]
}
      `.trim();

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are a meticulous Enterprise System Architect outputting rigid JSON topologies.' },
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
