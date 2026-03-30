import { supabase } from "../supabase";

/**
 * BRIDGEBOX TOKEN TRACKER
 * Intercepts AI provider completions and logs exact token usage
 * to the token_usage_logs ledger for real-time cost visibility.
 */

export interface TokenLogEntry {
  organizationId: string;
  userId?: string;
  featureContext: string;
  agentName?: string;
  workflowId?: string;
  integrationId?: string;
  documentId?: string;
  promptTokens: number;
  completionTokens: number;
  aiModel?: string;
  aiProvider?: string;
  requestMetadata?: Record<string, any>;
}

// Cost per 1K tokens by model (USD)
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.0025, output: 0.01 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
  "claude-3-5-sonnet": { input: 0.003, output: 0.015 },
  "claude-3-haiku": { input: 0.00025, output: 0.00125 },
  "gemini-1.5-pro": { input: 0.00125, output: 0.005 },
  "gemini-2.0-flash": { input: 0.000075, output: 0.0003 },
  default: { input: 0.002, output: 0.008 },
};

function computeCostUSD(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  const rates = MODEL_RATES[model] || MODEL_RATES["default"];
  return (
    (promptTokens / 1000) * rates.input +
    (completionTokens / 1000) * rates.output
  );
}

/**
 * Log a token usage event from an AI provider response.
 * Fire-and-forget — should not block the calling agent.
 */
export async function logTokenUsage(entry: TokenLogEntry): Promise<void> {
  try {
    const model = entry.aiModel || "gpt-4o";
    const costUsd = computeCostUSD(
      model,
      entry.promptTokens,
      entry.completionTokens,
    );

    const { error } = await supabase.from("bb_token_usage_logs").insert({
      organization_id: entry.organizationId,
      user_id: entry.userId || null,
      feature_context: entry.featureContext,
      agent_name: entry.agentName || null,
      workflow_id: entry.workflowId || null,
      integration_id: entry.integrationId || null,
      document_id: entry.documentId || null,
      prompt_tokens: entry.promptTokens,
      completion_tokens: entry.completionTokens,
      ai_model: model,
      ai_provider: entry.aiProvider || "openai",
      cost_usd: costUsd,
      request_metadata: entry.requestMetadata || {},
    });

    if (error) {
      console.warn("[TokenTracker] Failed to log token usage:", error.message);
    }
  } catch (err) {
    // Never block the main AI flow due to logging failures
    console.warn("[TokenTracker] Silently swallowing error:", err);
  }
}

/**
 * Get token usage summary for an organization.
 */
export async function getOrganizationTokenSummary(
  organizationId: string,
  periodDays: number = 30,
) {
  const since = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("bb_token_usage_logs")
    .select(
      "prompt_tokens, completion_tokens, total_tokens, cost_usd, feature_context, ai_model, created_at",
    )
    .eq("organization_id", organizationId)
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const totalTokens =
    data?.reduce((sum, r) => sum + (r.total_tokens || 0), 0) || 0;
  const totalCost =
    data?.reduce((sum, r) => sum + parseFloat(r.cost_usd || "0"), 0) || 0;

  // Group by feature_context
  const byFeature: Record<
    string,
    { tokens: number; cost: number; count: number }
  > = {};
  for (const row of data || []) {
    const ctx = row.feature_context || "unknown";
    if (!byFeature[ctx]) byFeature[ctx] = { tokens: 0, cost: 0, count: 0 };
    byFeature[ctx].tokens += row.total_tokens || 0;
    byFeature[ctx].cost += parseFloat(row.cost_usd || "0");
    byFeature[ctx].count += 1;
  }

  // Project monthly usage
  const daysElapsed = Math.max(1, periodDays);
  const projectedMonthlyTokens = Math.round((totalTokens / daysElapsed) * 30);
  const projectedMonthlyCost = (totalCost / daysElapsed) * 30;

  return {
    totalTokens,
    totalCost: Math.round(totalCost * 10000) / 10000,
    eventCount: data?.length || 0,
    byFeature,
    projectedMonthlyTokens,
    projectedMonthlyCost: Math.round(projectedMonthlyCost * 100) / 100,
    logs: data || [],
  };
}

/**
 * Get per-user token breakdown for an organization.
 */
export async function getUserTokenBreakdown(
  organizationId: string,
  periodDays: number = 30,
) {
  const since = new Date(
    Date.now() - periodDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("bb_token_usage_logs")
    .select("user_id, prompt_tokens, completion_tokens, total_tokens, cost_usd")
    .eq("organization_id", organizationId)
    .gte("created_at", since);

  if (error) throw error;

  const byUser: Record<
    string,
    { tokens: number; cost: number; events: number }
  > = {};
  for (const row of data || []) {
    const userId = row.user_id || "system";
    if (!byUser[userId]) byUser[userId] = { tokens: 0, cost: 0, events: 0 };
    byUser[userId].tokens += row.total_tokens || 0;
    byUser[userId].cost += parseFloat(row.cost_usd || "0");
    byUser[userId].events += 1;
  }

  return byUser;
}
