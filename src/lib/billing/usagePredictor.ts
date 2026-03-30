import { supabase } from "../supabase";

/**
 * BRIDGEBOX USAGE PREDICTOR
 *
 * Uses time-series token_usage_logs data to:
 * - Fit a linear trend over daily buckets
 * - Project next-30-day usage with a confidence interval
 * - Detect acceleration / deceleration in usage growth
 * - Score data quality (to drive confidence scoring in pricing)
 */

export interface DailyBucket {
  date: string; // YYYY-MM-DD
  tokens: number;
  costUsd: number;
  events: number;
}

export interface TrendLine {
  slope: number; // tokens per day (positive = growing)
  intercept: number; // tokens on day 0
  r2: number; // 0–1, how well the line fits (1 = perfect)
}

export interface UsagePrediction {
  // Historical window
  windowDays: number;
  dailyBuckets: DailyBucket[];
  averageDailyTokens: number;
  averageDailyCost: number;

  // Trend
  trend: TrendLine;
  growthRatePercent: number; // % change per 30 days based on slope
  accelerating: boolean; // slope is positive

  // 30-day projection
  projectedTokens30d: number;
  projectedCost30d: number;
  lowerBound30d: number; // 80% confidence lower
  upperBound30d: number; // 80% confidence upper

  // Confidence
  confidenceScore: number; // 0–100 (higher = more data, better fit)
  confidenceLabel: "very_low" | "low" | "moderate" | "high" | "very_high";
  confidenceReason: string; // Plain-English explanation
  dataSampleSize: number; // Number of log events used
}

export interface WorkflowUsageStat {
  workflowId: string;
  executionCount: number;
  totalTokens: number;
  avgTokensPerRun: number;
  totalCost: number;
  lastExecuted: string;
}

export interface IntegrationLoadStat {
  integrationId: string;
  syncCount: number;
  avgTokensPerSync: number;
  totalCost: number;
  lastSync: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ordinary Least Squares linear regression on (x, y) pairs.
 */
function linearRegression(xs: number[], ys: number[]): TrendLine {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let ssXY = 0,
    ssXX = 0;
  for (let i = 0; i < n; i++) {
    ssXY += (xs[i] - meanX) * (ys[i] - meanY);
    ssXX += (xs[i] - meanX) ** 2;
  }
  const slope = ssXX === 0 ? 0 : ssXY / ssXX;
  const intercept = meanY - slope * meanX;

  // R² calculation
  const ssRes = ys.reduce(
    (acc, y, i) => acc + (y - (slope * xs[i] + intercept)) ** 2,
    0,
  );
  const ssTot = ys.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2 };
}

/**
 * Build confidence label + reason from score.
 */
function buildConfidence(
  score: number,
  sampleSize: number,
  r2: number,
  windowDays: number,
): Pick<UsagePrediction, "confidenceLabel" | "confidenceReason"> {
  let label: UsagePrediction["confidenceLabel"];
  if (score >= 80) label = "very_high";
  else if (score >= 65) label = "high";
  else if (score >= 45) label = "moderate";
  else if (score >= 25) label = "low";
  else label = "very_low";

  let reason: string;
  if (sampleSize === 0) {
    reason =
      "No usage data yet — pricing is based on your onboarding estimates.";
  } else if (windowDays < 7) {
    reason = `Only ${windowDays} day(s) of usage data. Predictions will improve significantly after 14+ days.`;
  } else if (r2 < 0.4) {
    reason = `${sampleSize} events recorded but usage patterns are highly variable. Wider confidence interval applied.`;
  } else if (score >= 65) {
    reason = `${sampleSize} events across ${windowDays} days with stable trend (R²=${r2.toFixed(2)}). Prediction is reliable.`;
  } else {
    reason = `${sampleSize} events across ${windowDays} days. More data will narrow the confidence interval.`;
  }

  return { confidenceLabel: label, confidenceReason: reason };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PREDICTOR
// ─────────────────────────────────────────────────────────────────────────────

export async function predictUsage(
  organizationId: string,
  windowDays = 60,
): Promise<UsagePrediction> {
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from("bb_token_usage_logs")
    .select("total_tokens, cost_usd, created_at")
    .eq("organization_id", organizationId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const rows = data || [];

  // ── Bucket by day ─────────────────────────────────────────────────────────
  const bucketMap: Map<string, DailyBucket> = new Map();

  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    const existing = bucketMap.get(date) ?? {
      date,
      tokens: 0,
      costUsd: 0,
      events: 0,
    };
    existing.tokens += row.total_tokens || 0;
    existing.costUsd += parseFloat(row.cost_usd || "0");
    existing.events += 1;
    bucketMap.set(date, existing);
  }

  // Fill in zero-token days (ensures trend doesn't assume "missing = zero")
  const dailyBuckets = Array.from(bucketMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const n = dailyBuckets.length;
  const totalTokens = dailyBuckets.reduce((s, b) => s + b.tokens, 0);
  const totalCost = dailyBuckets.reduce((s, b) => s + b.costUsd, 0);
  const averageDailyTokens = n > 0 ? totalTokens / n : 0;
  const averageDailyCost = n > 0 ? totalCost / n : 0;

  // ── Trend line ─────────────────────────────────────────────────────────────
  const xs = dailyBuckets.map((_, i) => i);
  const ys = dailyBuckets.map((b) => b.tokens);
  const trend = linearRegression(xs, ys);

  const growthRatePercent =
    averageDailyTokens > 0
      ? Math.round(((trend.slope * 30) / averageDailyTokens) * 100)
      : 0;

  // ── 30-day projection ──────────────────────────────────────────────────────
  const projectedDailyTokens = Math.max(
    0,
    trend.intercept + trend.slope * (n + 15),
  );
  const projectedTokens30d = Math.round(projectedDailyTokens * 30);
  const projectedCost30d =
    projectedTokens30d * (averageDailyCost / Math.max(averageDailyTokens, 1));

  // Residual standard deviation for confidence interval
  let residualSumSq = 0;
  for (let i = 0; i < n; i++) {
    residualSumSq += (ys[i] - (trend.slope * xs[i] + trend.intercept)) ** 2;
  }
  const stdDev =
    n > 2 ? Math.sqrt(residualSumSq / (n - 2)) : projectedDailyTokens * 0.4;
  // 80% CI ≈ ±1.28 standard deviations of daily * 30
  const marginTokens = Math.round(stdDev * 1.28 * Math.sqrt(30));
  const lowerBound30d = Math.max(0, projectedTokens30d - marginTokens);
  const upperBound30d = projectedTokens30d + marginTokens;

  // ── Confidence score ───────────────────────────────────────────────────────
  let score = 0;

  // Data volume: max 30 pts
  score += Math.min(30, rows.length * 0.6);

  // Window coverage: max 25 pts
  const actualWindowDays = n;
  score += Math.min(25, actualWindowDays * 0.8);

  // Trend fit quality (R²): max 30 pts
  score += Math.round(trend.r2 * 30);

  // Consistency bonus: max 15 pts (if usage > 0 for > 60% of days in window)
  const activeDays = dailyBuckets.filter((b) => b.tokens > 0).length;
  const activeFraction = n > 0 ? activeDays / n : 0;
  score += Math.round(activeFraction * 15);

  const confidenceScore = Math.min(100, Math.round(score));
  const { confidenceLabel, confidenceReason } = buildConfidence(
    confidenceScore,
    rows.length,
    trend.r2,
    actualWindowDays,
  );

  return {
    windowDays,
    dailyBuckets,
    averageDailyTokens: Math.round(averageDailyTokens),
    averageDailyCost: Math.round(averageDailyCost * 10000) / 10000,
    trend,
    growthRatePercent,
    accelerating: trend.slope > 0,
    projectedTokens30d,
    projectedCost30d: Math.round(projectedCost30d * 100) / 100,
    lowerBound30d,
    upperBound30d,
    confidenceScore,
    confidenceLabel,
    confidenceReason,
    dataSampleSize: rows.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW-SPECIFIC USAGE STATS
// ─────────────────────────────────────────────────────────────────────────────

export async function getWorkflowUsageStats(
  organizationId: string,
  daysBack = 30,
): Promise<WorkflowUsageStat[]> {
  const since = new Date(Date.now() - daysBack * 86_400_000).toISOString();

  const { data } = await supabase
    .from("bb_token_usage_logs")
    .select("workflow_id, total_tokens, cost_usd, created_at")
    .eq("organization_id", organizationId)
    .not("workflow_id", "is", null)
    .gte("created_at", since);

  const map: Map<string, WorkflowUsageStat> = new Map();
  for (const row of data || []) {
    const id = row.workflow_id;
    const existing = map.get(id) ?? {
      workflowId: id,
      executionCount: 0,
      totalTokens: 0,
      avgTokensPerRun: 0,
      totalCost: 0,
      lastExecuted: row.created_at,
    };
    existing.executionCount += 1;
    existing.totalTokens += row.total_tokens || 0;
    existing.totalCost += parseFloat(row.cost_usd || "0");
    existing.lastExecuted =
      row.created_at > existing.lastExecuted
        ? row.created_at
        : existing.lastExecuted;
    map.set(id, existing);
  }

  return Array.from(map.values()).map((w) => ({
    ...w,
    avgTokensPerRun:
      w.executionCount > 0 ? Math.round(w.totalTokens / w.executionCount) : 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// INTEGRATION-SPECIFIC USAGE STATS
// ─────────────────────────────────────────────────────────────────────────────

export async function getIntegrationLoadStats(
  organizationId: string,
  daysBack = 30,
): Promise<IntegrationLoadStat[]> {
  const since = new Date(Date.now() - daysBack * 86_400_000).toISOString();

  const { data } = await supabase
    .from("bb_token_usage_logs")
    .select("integration_id, total_tokens, cost_usd, created_at")
    .eq("organization_id", organizationId)
    .not("integration_id", "is", null)
    .gte("created_at", since);

  const map: Map<string, IntegrationLoadStat> = new Map();
  for (const row of data || []) {
    const id = row.integration_id;
    const existing = map.get(id) ?? {
      integrationId: id,
      syncCount: 0,
      avgTokensPerSync: 0,
      totalCost: 0,
      lastSync: row.created_at,
    };
    existing.syncCount += 1;
    existing.avgTokensPerSync =
      (existing.avgTokensPerSync * (existing.syncCount - 1) +
        (row.total_tokens || 0)) /
      existing.syncCount;
    existing.totalCost += parseFloat(row.cost_usd || "0");
    existing.lastSync =
      row.created_at > existing.lastSync ? row.created_at : existing.lastSync;
    map.set(id, existing);
  }

  return Array.from(map.values());
}
