// ─────────────────────────────────────────────────────────────────────────────
// useEntitlements — React hook for feature gating throughout the app
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  hasFeature,
  getEntitlements,
  getUpgradeContext,
  getCreditCost,
  getCreditAllowance,
  getRecordingLimit,
  getWorkspaceLimit,
  getIntegrationLimit,
  getUserLimit,
  isUnlimited,
} from "../lib/entitlements";
import type { FeatureKey, EntitlementMap } from "../types/billing";

export interface EntitlementState {
  /** Full entitlement map for the current plan */
  entitlements: EntitlementMap;

  /** Check if a specific feature is available */
  can: (feature: FeatureKey) => boolean;

  /** Get upgrade context for a locked feature (for UpgradeModal) */
  upgradeRequired: (feature: FeatureKey) => {
    requiredPlan: string;
    requiredPlanTier: string | null;
    message: string;
    isLocked: boolean;
  };

  /** Credit info */
  credits: {
    balance: number;
    used: number;
    total: number; // monthly allowance
    remaining: number;
    pct: number; // 0-100
    isLow: boolean; // < 20%
    isCritical: boolean; // < 5%
    isUnlimited: boolean; // enterprise
  };

  /** Plan info */
  planTier: string;
  planName: string;
  isEnterprise: boolean;
  isLoading: boolean;

  /** Limits */
  limits: {
    recordings: number;
    workspaces: number;
    integrations: number;
    usersPerWorkspace: number;
  };

  /** Credit cost for a given feature */
  creditCostFor: (feature: FeatureKey) => number;
}

/**
 * Primary hook for feature gating. Use this anywhere in the app.
 *
 * @example
 * const { can, upgradeRequired } = useEntitlements();
 * if (!can('screen_recording_analysis')) { ... }
 */
export function useEntitlements(
  creditBalance = 0,
  creditsUsed = 0,
): EntitlementState {
  const { currentOrganization } = useAuth();

  const planTier = (currentOrganization as any)?.billing_plan ?? "starter";
  const planName = planTier.charAt(0).toUpperCase() + planTier.slice(1);
  const isEnterprise =
    (currentOrganization as any)?.is_enterprise_client === true ||
    planTier === "enterprise";

  const entitlements = useMemo(() => getEntitlements(planTier), [planTier]);
  const monthlyAllowance = getCreditAllowance(planTier);
  const unlimited = isUnlimited(monthlyAllowance) || isEnterprise;

  const balance = creditBalance;
  const total = unlimited ? 9999 : monthlyAllowance;
  const remaining = unlimited ? 9999 : Math.max(0, balance);
  const pct = unlimited
    ? 0
    : total > 0
      ? Math.round((remaining / total) * 100)
      : 0;

  const credits = {
    balance,
    used: creditsUsed,
    total,
    remaining,
    pct,
    isLow: !unlimited && pct < 20,
    isCritical: !unlimited && pct < 5,
    isUnlimited: unlimited,
  };

  const limits = {
    recordings: getRecordingLimit(planTier),
    workspaces: getWorkspaceLimit(planTier),
    integrations: getIntegrationLimit(planTier),
    usersPerWorkspace: getUserLimit(planTier),
  };

  return {
    entitlements,
    can: (feature: FeatureKey) => isEnterprise || hasFeature(planTier, feature),
    upgradeRequired: (feature: FeatureKey) =>
      getUpgradeContext(feature, planTier),
    credits,
    planTier,
    planName,
    isEnterprise,
    isLoading: false,
    limits,
    creditCostFor: getCreditCost,
  };
}
