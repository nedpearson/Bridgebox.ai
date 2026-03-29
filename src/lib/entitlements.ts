// ─────────────────────────────────────────────────────────────────────────────
// BRIDGEBOX ENTITLEMENTS ENGINE
// Defines what each plan tier unlocks and provides helper functions for
// feature gating throughout the application.
// ─────────────────────────────────────────────────────────────────────────────

import type { FeatureKey, EntitlementMap, PlanTier } from '../types/billing';
import { PLANS, getPlanByTier } from './plans';

// ─── Per-Plan Entitlement Maps ────────────────────────────────────────────────

const ALL_FEATURES: FeatureKey[] = [
  'voice_to_app',
  'screen_recording_analysis',
  'screenshot_analysis',
  'blueprint_generation',
  'workspace_learning_ai',
  'reusable_feature_packs',
  'workspace_merge',
  'advanced_integrations',
  'export_blueprint',
  'premium_admin_controls',
  'multi_workspace',
  'white_glove_onboarding',
  'priority_support',
  'custom_branding',
  'sso_ready',
  'audit_controls',
  'predictive_recommendations',
  'implementation_queue',
  'analytics_suite',
];

function buildEntitlementMap(grantedKeys: FeatureKey[]): EntitlementMap {
  return ALL_FEATURES.reduce((map, key) => {
    map[key] = grantedKeys.includes(key);
    return map;
  }, {} as EntitlementMap);
}

export const PLAN_ENTITLEMENTS: Record<string, EntitlementMap> = Object.fromEntries(
  PLANS.map((plan) => [plan.tier, buildEntitlementMap(plan.entitlements)])
);

// ─── Credit Cost Registry ─────────────────────────────────────────────────────

export const CREDIT_COST_BY_FEATURE: Partial<Record<FeatureKey, number>> = {
  voice_to_app: 5,
  screen_recording_analysis: 8,
  screenshot_analysis: 3,
  blueprint_generation: 10,
  workspace_learning_ai: 15,
  predictive_recommendations: 15,
};

// ─── Core Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns the full entitlement map for a given plan tier.
 * Falls back to starter if tier is unrecognised.
 */
export function getEntitlements(planTier: string): EntitlementMap {
  return PLAN_ENTITLEMENTS[planTier] ?? PLAN_ENTITLEMENTS['starter'];
}

/**
 * Returns true if the given plan tier has access to the feature.
 * Also accepts an array of admin override keys.
 */
export function hasFeature(
  planTier: string,
  feature: FeatureKey,
  adminOverrides?: FeatureKey[]
): boolean {
  if (adminOverrides?.includes(feature)) return true;
  return getEntitlements(planTier)[feature] ?? false;
}

/**
 * Monthly credit allocation for a plan tier.
 * Returns -1 for enterprise (unlimited).
 */
export function getCreditAllowance(planTier: string): number {
  const plan = getPlanByTier(planTier);
  return plan?.monthlyCredits ?? 50;
}

/**
 * Returns the minimum plan tier that grants a given feature.
 */
export function getRequiredPlanForFeature(feature: FeatureKey): PlanTier | null {
  const order: PlanTier[] = ['starter', 'growth', 'pro', 'enterprise'];
  for (const tier of order) {
    if (PLAN_ENTITLEMENTS[tier]?.[feature]) return tier;
  }
  return null;
}

/**
 * Returns a human-readable plan name for the required tier.
 */
export function getRequiredPlanLabel(feature: FeatureKey): string {
  const tier = getRequiredPlanForFeature(feature);
  if (!tier) return 'Enterprise';
  const plan = getPlanByTier(tier);
  return plan?.name ?? 'Upgrade Required';
}

/**
 * Returns the credit cost for a given feature action.
 * Returns 0 if the feature doesn't consume credits.
 */
export function getCreditCost(feature: FeatureKey): number {
  return CREDIT_COST_BY_FEATURE[feature] ?? 0;
}

/**
 * Returns upgrade context for a locked feature — used to power UpgradeModal.
 */
export function getUpgradeContext(feature: FeatureKey, currentTier: string): {
  requiredPlan: string;
  requiredPlanTier: PlanTier | null;
  message: string;
  isLocked: boolean;
} {
  const locked = !hasFeature(currentTier, feature);
  const requiredPlanTier = getRequiredPlanForFeature(feature);
  const requiredPlan = getRequiredPlanLabel(feature);

  const FEATURE_UPGRADE_MESSAGES: Partial<Record<FeatureKey, string>> = {
    screen_recording_analysis:
      'Show us your current software. We\'ll analyze the recordings and extract every workflow your team relies on.',
    workspace_learning_ai:
      'Your AI learns your business over time — improving every recommendation, reducing friction, and speeding future builds.',
    workspace_merge:
      'Combine approved features from multiple workspaces into a unified platform blueprint.',
    predictive_recommendations:
      'Bridgebox predicts your next best feature based on usage patterns and workspace intelligence.',
    multi_workspace:
      'Manage multiple client workspaces or product lines from a single operator view.',
    white_glove_onboarding:
      'A Bridgebox specialist guides your full discovery session and sets up your intelligence profile.',
    reusable_feature_packs:
      'Build once, reuse everywhere — save feature modules across workspaces and client projects.',
    implementation_queue:
      'Control feature prioritization, sprint order, and delivery timelines from your workspace.',
  };

  return {
    requiredPlan,
    requiredPlanTier,
    message: FEATURE_UPGRADE_MESSAGES[feature] ??
      `This feature requires the ${requiredPlan} plan. Upgrade to unlock it.`,
    isLocked: locked,
  };
}

// ─── Limit Helpers ─────────────────────────────────────────────────────────────

export function getRecordingLimit(planTier: string): number {
  const plan = getPlanByTier(planTier);
  return plan?.maxRecordingsPerMonth ?? 3;
}

export function getWorkspaceLimit(planTier: string): number {
  const plan = getPlanByTier(planTier);
  return plan?.maxWorkspaces ?? 1;
}

export function getIntegrationLimit(planTier: string): number {
  const plan = getPlanByTier(planTier);
  return plan?.maxIntegrations ?? 2;
}

export function getUserLimit(planTier: string): number {
  const plan = getPlanByTier(planTier);
  return plan?.maxUsersPerWorkspace ?? 5;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}
