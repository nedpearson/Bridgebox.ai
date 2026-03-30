import { Logger } from "../logger";
import { supabase } from "../supabase";

const OPENAI_SYSTEM_PROMPT = `
You are the Bridgebox Antigravity Intelligence Node. Your sole purpose is to translate natural language descriptions of business operations into highly structured, schema-compliant JSON blueprints. 

The output MUST be a strict JSON object mapping to the BridgeboxTemplate configuration_payload schema. 
It must contain:
1. "name" (string)
2. "description" (string)
3. "category" (string)
4. "target_personas" (array of strings)
5. "configuration_payload" (object) containing:
   - "entities": array of objects { name: string, fields: string[] }
   - "workflows": array of objects { name: string, trigger_type: string, steps: object[] }
   - "forms": array of objects { name: string }
   - "ai_agents": array of objects { name: string, role: string }
   - "mobile_config": object containing:
       - "staff_app": { enabled: boolean, views: string[], features: string[] } (e.g. camera, voice-notes)
       - "customer_app": { enabled: boolean, views: string[], features: string[] } (e.g. portal, booking, uploads)
       - "offline_sync_enabled": boolean
6. "merge_strategy" (must be "skip_existing", "overwrite", or "merge_fields")

No markdown formatting. Output raw verifiable JSON only.
`;

export const aiTemplateGenerator = {
  /**
   * Triggers the generative pipeline, exchanging a user prompt for a fully valid Bridgebox template schema.
   */
  async generateFromPrompt(
    prompt: string,
    organizationId: string,
    previousContext?: string,
  ) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      Logger.warn(
        "OpenAI API Key is missing. Falling back to structured mock generation for development.",
      );
      return this.fallbackGeneration(prompt);
    }

    Logger.info(
      `[AI Generator] Requesting blueprint for: "${prompt.substring(0, 50)}..."`,
    );

    try {
      const messages: any[] = [
        { role: "system", content: OPENAI_SYSTEM_PROMPT },
      ];

      if (previousContext) {
        messages.push({ role: "assistant", content: previousContext });
        messages.push({
          role: "user",
          content: `Please refine the previous template based on this new feedback: ${prompt}`,
        });
      } else {
        messages.push({ role: "user", content: prompt });
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4-turbo-preview",
            messages: messages,
            response_format: { type: "json_object" },
            temperature: 0.2,
          }),
        },
      );

      if (!response.ok) {
        const errorPayload = await response.json();
        throw new Error(
          `OpenAI API Error: ${errorPayload.error?.message || response.statusText}`,
        );
      }

      const data = await response.json();
      const rawContent = data.choices[0].message.content || "{}";
      const cleanJson = rawContent.replace(/```json\s*|```\s*/g, "").trim();

      // Parse and validate the rigid JSON payload
      const generatedPayload = JSON.parse(cleanJson);

      // Wrap the generated data in the base shell schema required by Bridgebox
      return {
        id: crypto.randomUUID(),
        name: generatedPayload.name || "AI Generated Workspace",
        description:
          generatedPayload.description ||
          `Mapped from prompt: ${prompt.substring(0, 50)}`,
        category: generatedPayload.category || "ai_generated",
        version: "1.0.0",
        status: "draft",
        target_personas: generatedPayload.target_personas || ["admin"],
        configuration_payload: generatedPayload.configuration_payload || {
          entities: [],
          workflows: [],
          forms: [],
          ai_agents: [],
          mobile_config: {
            staff_app: { enabled: true, views: ["Dashboard"], features: [] },
            customer_app: { enabled: false, views: [], features: [] },
            offline_sync_enabled: true,
          },
        },
        billing_rules: {},
        branding_tokens: {},
        is_overlay: false,
        merge_strategy: generatedPayload.merge_strategy || "skip_existing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (err: any) {
      Logger.error("Generative pipeline failed:", err);
      throw new Error(`AI Template Generation failed: ${err.message}`);
    }
  },

  /**
   * Clean fallback for missing keys during dev testing
   */
  fallbackGeneration(prompt: string) {
    return {
      id: crypto.randomUUID(),
      name: "Demo AI Operations Map",
      description: `AI-Generated Template mapped from prompt: "${prompt.substring(0, 50)}..."`,
      category: "ai_generated",
      version: "1.0.0",
      status: "draft",
      target_personas: ["admin", "manager"],
      configuration_payload: {
        entities: [
          { name: "Service Requests", fields: ["title", "priority", "status"] },
        ],
        workflows: [
          { name: "Approval Routing", trigger_type: "manual", steps: [] },
        ],
        forms: [{ name: "Intake Form" }],
        ai_agents: [{ name: "Dispatch Copilot", role: "Routing Assistant" }],
        mobile_config: {
          staff_app: {
            enabled: true,
            views: ["Route Map", "Job Details"],
            features: ["Camera", "Voice-to-Text"],
          },
          customer_app: {
            enabled: true,
            views: ["Client Portal", "Appointment Booking"],
            features: ["Messaging", "Payments"],
          },
          offline_sync_enabled: true,
        },
      },
      billing_rules: {},
      branding_tokens: {},
      is_overlay: false,
      merge_strategy: "skip_existing",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },
};
