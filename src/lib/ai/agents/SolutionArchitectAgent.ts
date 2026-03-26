import { AIProviderFactory } from '../providers';
import { AgentRegistry, AgentPayload } from './AgentRegistry';

export interface ProposedSchema {
  primary_entity_name: string; // e.g. "Matters", "Projects", "Cases"
  custom_fields: Array<{ name: string, type: 'text' | 'number' | 'date' | 'boolean', description: string }>;
  required_modules: string[]; // e.g. ["Documents", "Communications", "Tasks"]
  reasoning: string;
}

export const SolutionArchitectAgent = {
  /**
   * Reads raw business intent and proposes a structural Relational Database Schema mapping
   * specifically constrained to Bridgebox's capabilities.
   */
  async architect(payload: AgentPayload) {
    return AgentRegistry.execute<ProposedSchema>('SolutionArchitectAgent', payload, async () => {
      const provider = AIProviderFactory.getProvider();
      if (!provider.isConfigured()) throw new Error("AI Provider unavailable.");

      const prompt = `
You are the Bridgebox Solution Architect. A new client has provided the following onboarding intelligence:
"${payload.intent}"
Context Data: ${JSON.stringify(payload.context || {})}

Analyze their business model and output a strict JSON configuration linking their needs to Bridgebox.
Bridgebox has 4 core modules to choose from: ["Projects", "Leads", "Tasks", "Documents", "Invoices"].

Output JSON exactly matching this structure:
{
  "primary_entity_name": "What should we rename 'Projects' to locally? (e.g. Matters, Cases, Deals)",
  "custom_fields": [
    { "name": "field_name", "type": "text|number|date|boolean", "description": "Why we need this field" }
  ],
  "required_modules": ["Select exactly from the 4 core modules"],
  "reasoning": "A short summary explaining the architectural choices."
}
      `.trim();

      const response = await provider.complete({
        messages: [
          { role: 'system', content: 'You are an authoritative structural metadata designer outputting strict JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        ...({ responseFormat: "json_object" } as any)
      });

      if (!response.content) throw new Error("Empty AI Response");
      
      return JSON.parse(response.content) as ProposedSchema;
    });
  }
};
