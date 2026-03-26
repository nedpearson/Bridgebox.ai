import { supabase } from '../supabase';

/**
 * BRIDGEBOX PRICING ENGINE
 * Calculates dynamic monthly pricing based on AI usage, integrations,
 * workflows, storage, and feature complexity.
 */

export interface PricingInputs {
  organizationId: string;
  sessionId?: string;

  // AI Usage
  estimatedQueriesPerDay: number;
  documentProcessingVolume: number;   // documents/month
  workflowExecutionFrequency: 'low' | 'medium' | 'high' | 'enterprise';
  aiCopilotUsage: boolean;
  aiSearchUsage: boolean;
  aiGenerationUsage: boolean;

  // Integrations
  integrationCount: number;
  integrationComplexity: 'simple' | 'moderate' | 'deep';
  integrationSyncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';

  // Workflows
  workflowCount: number;
  automationDepth: 'basic' | 'moderate' | 'advanced' | 'fully_automated';

  // Users
  userCount: number;
  concurrencyLevel: 'low' | 'medium' | 'high';

  // Storage
  estimatedStorageGb: number;

  // Features
  customFeatureCount: number;

  // Support
  supportAgentUsage: 'basic' | 'standard' | 'advanced' | 'enterprise';
}

export interface PricingBreakdown {
  basePlatformFee: number;

  aiUsageCost: number;
  estimatedTokensPerMonth: number;
  aiTier: 'low' | 'medium' | 'high' | 'enterprise';

  workflowCost: number;
  integrationCost: number;
  storageCost: number;
  featureCost: number;
  supportCost: number;

  subtotal: number;
  totalMonthly: number;
  totalYearly: number;

  tier: 'low' | 'medium' | 'growth' | 'high' | 'enterprise';
  marginApplied: number;
  aiMarginFraction: number;

  // Source + accuracy metadata
  source: 'ai_estimate' | 'calibrated' | 'admin_override';
  confidenceScore: number;        // 0–100 (100 = calibrated from real data)
  confidenceLabel: 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';
  calibratedAt?: string;          // ISO timestamp if calibrated
  tokenDriftRatio?: number;       // actual / estimated (set after calibration)

  // Cost optimization hints
  optimizationOpportunities: string[];
}

// Rate card (can be overridden by admin per pricing_templates)
const RATE_CARD = {
  baseFeeByTier: {
    low: 1500,
    medium: 2500,
    growth: 5000,
    high: 8000,
    enterprise: 15000,
  },
  costPer1kTokensUSD: 0.002,             // GPT-4o blended cost
  aiMarginMultiplier: 1.4,               // 40% margin

  workflowBaseCostPerMonth: 150,         // per workflow/month
  workflowFrequencyMultiplier: {
    low: 0.6,
    medium: 1.0,
    high: 1.8,
    enterprise: 3.0,
  },

  integrationBaseCostPerMonth: 200,      // per integration/month
  integrationComplexityMultiplier: {
    simple: 1.0,
    moderate: 1.75,
    deep: 3.0,
  },
  integrationSyncMultiplier: {
    weekly: 0.5,
    daily: 1.0,
    hourly: 2.0,
    realtime: 4.0,
  },

  storageCostPerGbPerMonth: 0.50,        // $0.50/GB
  documentProcessingCostPer100: 25,      // $25 per 100 docs processed

  featureCostPerCustomFeature: 500,      // per custom module/month

  supportCostByTier: {
    basic: 0,
    standard: 500,
    advanced: 1500,
    enterprise: 4000,
  },
};

/**
 * Estimate token consumption per month based on inputs.
 * Uses automation depth and user concurrency to sharpen the estimate.
 */
function estimateMonthlyTokens(inputs: PricingInputs): number {
  let tokens = 0;

  // AI queries: avg 2K tokens/query, adjusted for automation depth
  const automationLoadFactor = {
    basic: 0.7,
    moderate: 1.0,
    advanced: 1.5,
    fully_automated: 2.4,
  }[inputs.automationDepth] ?? 1.0;

  tokens += inputs.estimatedQueriesPerDay * 30 * 2000 * automationLoadFactor;

  // Document processing: 5K tokens/doc for extraction, 2K for summaries
  const docsMonthly = inputs.documentProcessingVolume;
  tokens += docsMonthly * 5000 + Math.min(docsMonthly * 0.3, 500) * 2000;

  // Workflow automation: tokens scale by execution frequency × step depth
  const workflowTokensPerExec = {
    basic: 300,
    moderate: 600,
    advanced: 1200,
    fully_automated: 2500,
  }[inputs.automationDepth] ?? 600;
  const workflowFreqMultiplier = { low: 1, medium: 3, high: 8, enterprise: 20 }[inputs.workflowExecutionFrequency];
  tokens += inputs.workflowCount * workflowFreqMultiplier * workflowTokensPerExec * 30;

  // AI Copilot: base 200K + 20K per active user above 5
  if (inputs.aiCopilotUsage) {
    tokens += 200_000 + Math.max(0, inputs.userCount - 5) * 20_000;
  }

  // AI Search: 100K base + scales with user count
  if (inputs.aiSearchUsage) {
    tokens += 100_000 + inputs.userCount * 5_000;
  }

  // AI Generation: 150K base + extra for high-frequency generators
  if (inputs.aiGenerationUsage) {
    tokens += 150_000;
  }

  // Integration sync events drive token usage for data mapping / transform
  const integrationTokensPerSync = {
    weekly: 500,
    daily: 500,
    hourly: 200,
    realtime: 80, // lightweight per-event, but high volume
  }[inputs.integrationSyncFrequency] ?? 300;
  const syncEventsPerMonth = {
    weekly: 4,
    daily: 30,
    hourly: 720,
    realtime: 44_640, // every minute
  }[inputs.integrationSyncFrequency] ?? 30;
  tokens += inputs.integrationCount * syncEventsPerMonth * integrationTokensPerSync;

  // Concurrency multiplier: high concurrency means more parallel calls
  const concurrencyMultiplier = { low: 0.85, medium: 1.0, high: 1.35 }[inputs.concurrencyLevel] ?? 1.0;
  tokens = Math.round(tokens * concurrencyMultiplier);

  return tokens;
}

/**
 * Determine the platform tier based on computed total usage.
 */
function determineTier(totalMonthly: number): 'low' | 'medium' | 'growth' | 'high' | 'enterprise' {
  if (totalMonthly < 2000) return 'low';
  if (totalMonthly < 5000) return 'medium';
  if (totalMonthly < 10000) return 'growth';
  if (totalMonthly < 20000) return 'high';
  return 'enterprise';
}

/**
 * Core pricing calculation function.
 * Returns a full pricing breakdown.
 */
export function calculatePricing(inputs: PricingInputs): PricingBreakdown {
  const optimizationOpportunities: string[] = [];

  // ---- AI TOKEN COST ----
  const estimatedTokensPerMonth = estimateMonthlyTokens(inputs);
  const rawAiCost = (estimatedTokensPerMonth / 1000) * RATE_CARD.costPer1kTokensUSD;
  const aiUsageCost = rawAiCost * RATE_CARD.aiMarginMultiplier;

  // Determine AI tier
  let aiTier: 'low' | 'medium' | 'high' | 'enterprise' = 'low';
  if (estimatedTokensPerMonth > 5_000_000) aiTier = 'enterprise';
  else if (estimatedTokensPerMonth > 2_000_000) aiTier = 'high';
  else if (estimatedTokensPerMonth > 500_000) aiTier = 'medium';

  // ---- WORKFLOW COST ----
  const workflowCost =
    inputs.workflowCount *
    RATE_CARD.workflowBaseCostPerMonth *
    RATE_CARD.workflowFrequencyMultiplier[inputs.workflowExecutionFrequency];

  // ---- INTEGRATION COST ----
  const integrationCost =
    inputs.integrationCount *
    RATE_CARD.integrationBaseCostPerMonth *
    RATE_CARD.integrationComplexityMultiplier[inputs.integrationComplexity] *
    RATE_CARD.integrationSyncMultiplier[inputs.integrationSyncFrequency];

  // ---- STORAGE COST ----
  const storageCost =
    inputs.estimatedStorageGb * RATE_CARD.storageCostPerGbPerMonth +
    (inputs.documentProcessingVolume / 100) * RATE_CARD.documentProcessingCostPer100;

  // ---- FEATURE COST ----
  const featureCost = inputs.customFeatureCount * RATE_CARD.featureCostPerCustomFeature;

  // ---- SUPPORT COST ----
  const supportCost = RATE_CARD.supportCostByTier[inputs.supportAgentUsage];

  // ---- SUBTOTAL ----
  const subtotal = aiUsageCost + workflowCost + integrationCost + storageCost + featureCost + supportCost;

  // ---- DETERMINE TIER & BASE FEE ----
  const tier = determineTier(subtotal);
  const basePlatformFee = RATE_CARD.baseFeeByTier[tier];

  const totalMonthly = basePlatformFee + subtotal;
  const totalYearly = totalMonthly * 10; // 2 months free for annual

  // ---- GENERATE OPTIMIZATION OPPORTUNITIES ----
  if (inputs.integrationSyncFrequency === 'realtime' && inputs.integrationCount > 3) {
    optimizationOpportunities.push(
      `Switching ${inputs.integrationCount} real-time integrations to hourly sync could reduce integration costs by ~50%.`
    );
  }
  if (estimatedTokensPerMonth > 2_000_000) {
    optimizationOpportunities.push(
      'High token usage detected. Enabling AI response caching could reduce token consumption by 15–30%.'
    );
  }
  if (inputs.workflowCount > 10 && inputs.workflowExecutionFrequency === 'high') {
    optimizationOpportunities.push(
      'Batching high-frequency workflow executions into scheduled batches could reduce workflow costs by ~25%.'
    );
  }
  if (inputs.documentProcessingVolume > 1000) {
    optimizationOpportunities.push(
      'Large document volumes detected. Enabling chunked batch processing can reduce per-document AI cost by up to 40%.'
    );
  }

  return {
    basePlatformFee,
    aiUsageCost: Math.round(aiUsageCost * 100) / 100,
    estimatedTokensPerMonth,
    aiTier,
    workflowCost: Math.round(workflowCost * 100) / 100,
    integrationCost: Math.round(integrationCost * 100) / 100,
    storageCost: Math.round(storageCost * 100) / 100,
    featureCost: Math.round(featureCost * 100) / 100,
    supportCost: Math.round(supportCost * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    totalMonthly: Math.round(totalMonthly * 100) / 100,
    totalYearly: Math.round(totalYearly * 100) / 100,
    tier,
    marginApplied: Math.round((RATE_CARD.aiMarginMultiplier - 1) * 100),
    aiMarginFraction: RATE_CARD.aiMarginMultiplier,
    // Default: AI estimate, confidence low until calibrated
    source: 'ai_estimate' as const,
    confidenceScore: 20,
    confidenceLabel: 'low' as const,
    optimizationOpportunities,
  };
}

/**
 * Persist a pricing model to the database from calculated inputs.
 */
export async function savePricingModel(
  inputs: PricingInputs,
  breakdown: PricingBreakdown
): Promise<string> {
  const { data, error } = await supabase
    .from('bb_pricing_models')
    .insert({
      organization_id: inputs.organizationId,
      session_id: inputs.sessionId || null,
      tier: breakdown.tier,
      status: 'pending_review',
      base_platform_fee: breakdown.basePlatformFee,
      estimated_tokens_per_month: breakdown.estimatedTokensPerMonth,
      cost_per_1k_tokens: RATE_CARD.costPer1kTokensUSD,
      ai_margin_multiplier: RATE_CARD.aiMarginMultiplier,
      estimated_ai_monthly_cost: breakdown.aiUsageCost,
      workflow_count: inputs.workflowCount,
      workflow_execution_frequency: inputs.workflowExecutionFrequency,
      workflow_complexity_weight: RATE_CARD.workflowFrequencyMultiplier[inputs.workflowExecutionFrequency],
      estimated_workflow_monthly_cost: breakdown.workflowCost,
      integration_count: inputs.integrationCount,
      integration_sync_frequency: inputs.integrationSyncFrequency,
      integration_complexity: inputs.integrationComplexity,
      estimated_integration_monthly_cost: breakdown.integrationCost,
      estimated_storage_gb: inputs.estimatedStorageGb,
      document_processing_volume: inputs.documentProcessingVolume,
      estimated_storage_monthly_cost: breakdown.storageCost,
      custom_feature_count: inputs.customFeatureCount,
      estimated_feature_monthly_cost: breakdown.featureCost,
      support_agent_usage: inputs.supportAgentUsage,
      estimated_support_monthly_cost: breakdown.supportCost,
      estimated_total_monthly_cost: breakdown.totalMonthly,
      ai_inputs_snapshot: inputs,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Load the active pricing model for an organization.
 */
export async function getActivePricingModel(organizationId: string) {
  const { data, error } = await supabase
    .from('bb_pricing_models')
    .select('*')
    .eq('organization_id', organizationId)
    .in('status', ['approved', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Format a dollar amount for display.
 */
export function fmtCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format token count for display.
 */
export function fmtTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
  return `${tokens}`;
}
