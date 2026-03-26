import { supabase } from '../supabase';
import { predictUsage, getWorkflowUsageStats, getIntegrationLoadStats, type UsagePrediction } from './usagePredictor';
import { calculatePricing, type PricingInputs, type PricingBreakdown } from './pricingEngine';

/**
 * BRIDGEBOX PRICING CALIBRATOR
 *
 * Learns from real token_usage_logs to calibrate the pricing estimates
 * that were generated at onboarding time.
 *
 * Key outputs:
 * - Actual vs Estimated drift ratios (how accurate was the onboarding AI?)
 * - Calibration multipliers to correct future estimates for this org
 * - Calibrated pricing breakdown using real observed data
 * - Stored calibration records so accuracy improves over time
 */

export interface CalibrationRecord {
  organizationId: string;
  pricingModelId: string;
  calibratedAt: string;

  // Original onboarding estimates
  estimatedTokensPerMonth: number;
  estimatedMonthlyTotal: number;

  // Real observed data
  observedTokens30d: number;
  observedCost30d: number;
  projectedTokens30d: number;

  // Drift ratios (actual / estimated)
  tokenDriftRatio: number;    // >1 = using more than estimated
  costDriftRatio: number;     // >1 = costing more than estimated

  // Calibrated pricing
  calibratedMonthlyTotal: number;
  calibratedBreakdown: PricingBreakdown;
  calibratedInputs: PricingInputs;

  // Confidence
  confidenceScore: number;
  confidenceLabel: string;
  confidenceReason: string;
  dataSampleSize: number;          // number of raw token events used

  // Workflow and integration accuracy
  workflowAccuracyScore: number | null;    // 0-100, null if no workflow data
  integrationAccuracyScore: number | null; // 0-100, null if no integration data
}

export interface CalibrationResult {
  record: CalibrationRecord;
  prediction: UsagePrediction;
  wasCalibrated: boolean;        // false if not enough data to calibrate yet
  recommendedAction: 'no_change' | 'minor_adjustment' | 'significant_adjustment' | 'review_required';
  adjustmentSummary: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN CALIBRATOR
// ─────────────────────────────────────────────────────────────────────────────

export async function calibratePricingModel(
  organizationId: string,
  pricingModelId: string,
): Promise<CalibrationResult> {
  // Load existing pricing model
  const { data: model, error: modelError } = await supabase
    .from('pricing_models')
    .select('*')
    .eq('id', pricingModelId)
    .single();
  if (modelError || !model) throw new Error(`Pricing model not found: ${pricingModelId}`);

  // Run prediction engine on real data
  const prediction = await predictUsage(organizationId, 60);

  // Pull workflow and integration actuals
  const [workflowStats, integrationStats] = await Promise.all([
    getWorkflowUsageStats(organizationId, 30),
    getIntegrationLoadStats(organizationId, 30),
  ]);

  const wasCalibrated = prediction.dataSampleSize >= 10;

  const estimatedTokens = model.estimated_tokens_per_month ?? 0;
  const estimatedTotal = model.estimated_total_monthly_cost ?? 0;

  // ── Compute drift ratios ────────────────────────────────────────────────
  const tokenDriftRatio = estimatedTokens > 0
    ? Math.round((prediction.projectedTokens30d / estimatedTokens) * 1000) / 1000
    : 1.0;

  const costDriftRatio = estimatedTotal > 0 && prediction.projectedCost30d > 0
    ? Math.round((prediction.projectedCost30d / (estimatedTotal * 0.65)) * 1000) / 1000
    : 1.0;

  // ── Build calibrated inputs ───────────────────────────────────────────────
  const originalInputs: PricingInputs = model.ai_inputs_snapshot ?? {} as PricingInputs;

  // Calibrate AI query estimate based on observed token drift
  let calibratedInputs: PricingInputs = { ...originalInputs };

  if (wasCalibrated) {
    // Adjust daily queries to match observed token volume
    const observedQueriesPerDay = prediction.averageDailyTokens > 0
      ? Math.ceil(prediction.averageDailyTokens / 2000) // 2K tokens per query avg
      : originalInputs.estimatedQueriesPerDay;
    calibratedInputs.estimatedQueriesPerDay = observedQueriesPerDay;

    // Calibrate workflow frequency if we have real workflow data
    if (workflowStats.length > 0) {
      const totalWorkflowExecs = workflowStats.reduce((s, w) => s + w.executionCount, 0);
      const workflowExecsPerDay = totalWorkflowExecs / 30;
      if (workflowExecsPerDay > 20) calibratedInputs.workflowExecutionFrequency = 'enterprise';
      else if (workflowExecsPerDay > 10) calibratedInputs.workflowExecutionFrequency = 'high';
      else if (workflowExecsPerDay > 2) calibratedInputs.workflowExecutionFrequency = 'medium';
      else calibratedInputs.workflowExecutionFrequency = 'low';
    }

    // Calibrate integration count and complexity from actual data
    if (integrationStats.length > 0) {
      calibratedInputs.integrationCount = Math.max(
        originalInputs.integrationCount,
        integrationStats.length,
      );
      const avgSyncsPerIntegration = integrationStats.reduce((s, i) => s + i.syncCount, 0) / integrationStats.length;
      if (avgSyncsPerIntegration > 500) calibratedInputs.integrationSyncFrequency = 'realtime';
      else if (avgSyncsPerIntegration > 100) calibratedInputs.integrationSyncFrequency = 'hourly';
      else if (avgSyncsPerIntegration > 25) calibratedInputs.integrationSyncFrequency = 'daily';
      else calibratedInputs.integrationSyncFrequency = 'weekly';
    }
  }

  // Re-run pricing engine with calibrated inputs
  const calibratedBreakdown = calculatePricing(calibratedInputs);

  // ── Accuracy scoring ─────────────────────────────────────────────────────
  const workflowAccuracyScore = workflowStats.length > 0
    ? computeWorkflowAccuracy(workflowStats, originalInputs)
    : null;

  const integrationAccuracyScore = integrationStats.length > 0
    ? computeIntegrationAccuracy(integrationStats, originalInputs)
    : null;

  // ── Recommended action ───────────────────────────────────────────────────
  const drift = Math.abs(tokenDriftRatio - 1);
  let recommendedAction: CalibrationResult['recommendedAction'];
  let adjustmentSummary: string;

  if (!wasCalibrated) {
    recommendedAction = 'no_change';
    adjustmentSummary = `Insufficient usage data (${prediction.dataSampleSize} events). Calibration will activate after 10+ events.`;
  } else if (drift < 0.1) {
    recommendedAction = 'no_change';
    adjustmentSummary = `Onboarding estimates are accurate within ${Math.round(drift * 100)}%. No adjustment needed.`;
  } else if (drift < 0.25) {
    recommendedAction = 'minor_adjustment';
    adjustmentSummary = `Usage is ${tokenDriftRatio > 1 ? 'higher' : 'lower'} than estimated by ${Math.round(drift * 100)}%. Minor calibration applied.`;
  } else if (drift < 0.5) {
    recommendedAction = 'significant_adjustment';
    adjustmentSummary = `Usage diverged ${Math.round(drift * 100)}% from estimate. Pricing recalibrated using observed patterns.`;
  } else {
    recommendedAction = 'review_required';
    adjustmentSummary = `Usage is ${Math.round(drift * 100)}% ${tokenDriftRatio > 1 ? 'above' : 'below'} original estimate. Manual review recommended.`;
  }

  const record: CalibrationRecord = {
    organizationId,
    pricingModelId,
    calibratedAt: new Date().toISOString(),
    estimatedTokensPerMonth: estimatedTokens,
    estimatedMonthlyTotal: estimatedTotal,
    observedTokens30d: prediction.projectedTokens30d,
    observedCost30d: prediction.projectedCost30d,
    projectedTokens30d: prediction.projectedTokens30d,
    tokenDriftRatio,
    costDriftRatio,
    calibratedMonthlyTotal: calibratedBreakdown.totalMonthly,
    calibratedBreakdown,
    calibratedInputs,
    confidenceScore: prediction.confidenceScore,
    confidenceLabel: prediction.confidenceLabel,
    confidenceReason: prediction.confidenceReason,
    dataSampleSize: prediction.dataSampleSize,
    workflowAccuracyScore,
    integrationAccuracyScore,
  };

  // ── Persist calibration record to pricing_models ────────────────────────
  try {
    await supabase.from('pricing_models').update({
      calibrated_at: record.calibratedAt,
      calibrated_monthly_total: record.calibratedMonthlyTotal,
      token_drift_ratio: record.tokenDriftRatio,
      confidence_score: record.confidenceScore,
      confidence_label: record.confidenceLabel,
      calibration_metadata: {
        tokenDriftRatio,
        costDriftRatio,
        observedTokens30d: record.observedTokens30d,
        workflowAccuracyScore,
        integrationAccuracyScore,
        recommendedAction,
        adjustmentSummary,
      },
    }).eq('id', pricingModelId);
  } catch (err) {
    console.warn('[PricingCalibrator] Failed to persist calibration (non-fatal):', err);
  }

  return { record, prediction, wasCalibrated, recommendedAction, adjustmentSummary };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCURACY SCORERS
// ─────────────────────────────────────────────────────────────────────────────

function computeWorkflowAccuracy(
  stats: Awaited<ReturnType<typeof getWorkflowUsageStats>>,
  inputs: PricingInputs,
): number {
  const observedCount = stats.length;
  const expectedCount = inputs.workflowCount;
  if (expectedCount === 0) return 100;
  const countRatio = Math.min(observedCount, expectedCount) / Math.max(observedCount, expectedCount);
  return Math.round(countRatio * 100);
}

function computeIntegrationAccuracy(
  stats: Awaited<ReturnType<typeof getIntegrationLoadStats>>,
  inputs: PricingInputs,
): number {
  const observedCount = stats.length;
  const expectedCount = inputs.integrationCount;
  if (expectedCount === 0) return 100;
  const countRatio = Math.min(observedCount, expectedCount) / Math.max(observedCount, expectedCount);
  return Math.round(countRatio * 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// BULK CALIBRATION (for admin command center)
// ─────────────────────────────────────────────────────────────────────────────

export async function calibrateAllActiveModels(): Promise<{
  processed: number;
  failed: number;
  results: Array<{ pricingModelId: string; action: string; message: string }>;
}> {
  const { data: models } = await supabase
    .from('pricing_models')
    .select('id, organization_id')
    .in('status', ['active', 'approved']);

  const results: Array<{ pricingModelId: string; action: string; message: string }> = [];
  let processed = 0;
  let failed = 0;

  for (const model of models || []) {
    try {
      const result = await calibratePricingModel(model.organization_id, model.id);
      results.push({
        pricingModelId: model.id,
        action: result.recommendedAction,
        message: result.adjustmentSummary,
      });
      processed++;
    } catch (err: any) {
      results.push({ pricingModelId: model.id, action: 'error', message: err.message });
      failed++;
    }
  }

  return { processed, failed, results };
}
