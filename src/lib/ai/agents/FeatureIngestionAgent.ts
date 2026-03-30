import { AIProviderFactory } from "../providers";
import { AgentRegistry, AgentPayload } from "./AgentRegistry";

export interface AntigravityPrompt {
  feature_name: string;
  ui_components_needed: string[];
  database_tables_needed: string[];
  compiled_prompt: string;
  complexity: "low" | "medium" | "high";
}

export const FeatureIngestionAgent = {
  /**
   * Evaluates a custom feature request that Bridgebox cannot natively support through config,
   * completely drafting an explicit Antigravity system prompt to safely code the new feature into the Repository.
   */
  async draftCodePrompt(payload: AgentPayload) {
    return AgentRegistry.execute<AntigravityPrompt>(
      "FeatureIngestionAgent",
      payload,
      async () => {
        const provider = AIProviderFactory.getProvider();
        if (!provider.isConfigured())
          throw new Error("AI Provider unavailable.");

        const prompt = `
You are the Bridgebox Chief Technical Officer bridging the gap between client requirements and the Antigravity Code Assistant.
The client has requested a feature that Bridgebox cannot accomplish merely through configuration:
"${payload.intent}"
Context Data: ${JSON.stringify(payload.context || {})}

Your goal is to output a perfect, highly-detailed prompt that a human can copy-paste into the Antigravity Terminal to build this exact capability securely inside the Bridgebox React/Supabase architecture.

Output strictly this JSON format:
{
  "feature_name": "Short Name (e.g. Amortization Calculator)",
  "ui_components_needed": ["src/components/calculators/Amortization.tsx"],
  "database_tables_needed": ["none" or "new_schema_name"],
  "complexity": "low|medium|high",
  "compiled_prompt": "BRIDGEBOX ONLY - IMPLEMENT [Feature]. Objective: Build... Guidelines: Use Tailwind, Lucide React, enforce RLS tenant_id isolation..."
}

Ensure the compiled_prompt explicitly reminds the code AI to adhere to Bridgebox styling (Tailwind, Lucide) and strict multi-tenant Row Level Security (organization_id).
      `.trim();

        const response = await provider.complete({
          messages: [
            {
              role: "system",
              content:
                "You are a Senior Staff Engineer drafting explicit architectural code prompts.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2, // Slightly higher temperature allowed for creative prompt writing
          ...({ responseFormat: "json_object" } as any),
        });

        if (!response.content) throw new Error("Empty AI Response");
        return JSON.parse(response.content) as AntigravityPrompt;
      },
    );
  },
};
