import { supabase } from "./supabase";
import { SupportTicket } from "./supportTickets";
import { Logger } from "./logger";

/**
 * supportAi.ts
 *
 * Orchestrates LLM pipeline execution for Support Issues.
 * Capable of extracting severity, categories, and concise summaries
 * from long-form Tenant issue descriptions.
 */

export interface AITriageResult {
  ai_summary: string;
  ai_category: string;
  ai_severity: "low" | "medium" | "high" | "critical";
  ai_urgency: "low" | "medium" | "high" | "critical";
  ai_confidence: number;
  ai_product_area: string;
  ai_recommended_action: string;
  ai_status: "completed" | "failed";
}

export const supportAiApi = {
  /**
   * Invokes an LLM orchestration (stubbed for demonstration)
   * over a specific Support Ticket to map unstructured Tenant text
   * into highly structured Super Admin Metadata.
   */
  async triggerTriage(ticket: SupportTicket): Promise<AITriageResult> {
    try {
      // Mark as processing
      await supabase
        .from("bb_support_tickets")
        .update({ ai_status: "processing" })
        .eq("id", ticket.id);

      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        Logger.warn(
          "OpenAI API Key is missing. Falling back to structured mock generation for dev.",
        );
        const isUrgent =
          ticket.title.toLowerCase().includes("broken") ||
          ticket.category === "billing_issue";
        return {
          ai_summary: `Tenant reported an issue regarding ${ticket.title}.`,
          ai_category: ticket.category || "general_support",
          ai_severity: isUrgent ? "high" : "medium",
          ai_urgency: isUrgent ? "critical" : "medium",
          ai_confidence: 0.92,
          ai_product_area: "Dashboard Core",
          ai_recommended_action: "Engineering review required.",
          ai_status: "completed",
        };
      }

      const SYSTEM_PROMPT = `
      You are the Bridgebox Support AI Triage Node.
      Analyze this ticket title and description.
      Output STRICT JSON matching the AITriageResult interface keys: ai_summary, ai_category, ai_severity (low|medium|high|critical), ai_urgency (low|medium|high|critical), ai_confidence (0-1), ai_product_area, and ai_recommended_action.
      `;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Title: ${ticket.title}\nDesc: ${ticket.description}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        },
      );

      if (!response.ok) throw new Error("OpenAI Support Triage Failed.");

      const payload = await response.json();
      const rawContent = payload.choices[0].message.content || "{}";
      const cleanJson = rawContent.replace(/```json\s*|```\s*/g, "").trim();
      const aiResult = JSON.parse(cleanJson) as Partial<AITriageResult>;

      const finalResult: AITriageResult = {
        ai_summary: aiResult.ai_summary || "Analysis complete.",
        ai_category: aiResult.ai_category || "unknown",
        ai_severity: aiResult.ai_severity || "medium",
        ai_urgency: aiResult.ai_urgency || "medium",
        ai_confidence: aiResult.ai_confidence || 0.8,
        ai_product_area: aiResult.ai_product_area || "Platform Core",
        ai_recommended_action: aiResult.ai_recommended_action || "Review logs.",
        ai_status: "completed",
      };

      // Push final result to Supabase
      const { error } = await supabase
        .from("bb_support_tickets")
        .update({
          ...finalResult,
          ai_processed_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      if (error) throw error;

      return finalResult;
    } catch (err: any) {
      Logger.error("[Support AI] Pipeline Error:", err);
      await supabase
        .from("bb_support_tickets")
        .update({ ai_status: "failed", ai_error: err.message })
        .eq("id", ticket.id);
      throw err;
    }
  },
};
