import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export type PlanType = 'starter' | 'growth' | 'pro' | 'enterprise';

export interface EntitlementPayload {
  maxUsers: number | 'unlimited';
  maxWorkspaces: number | 'unlimited';
  maxAiPayload: number | 'custom';
  // Granular Boolean Access Gates
  features: {
    canUseAiDrafting: boolean;
    canUseWhiteLabel: boolean;
    canCompileMobile: boolean;
    canExportAnalytics: boolean;
    canInvokeWebhooks: boolean;
  };
}

const PLAN_MATRIX: Record<PlanType, EntitlementPayload> = {
  starter: {
    maxUsers: 3,
    maxWorkspaces: 1,
    maxAiPayload: 1000,
    features: {
      canUseAiDrafting: false,
      canUseWhiteLabel: false,
      canCompileMobile: false,
      canExportAnalytics: false,
      canInvokeWebhooks: true,
    }
  },
  growth: {
    maxUsers: 15,
    maxWorkspaces: 3,
    maxAiPayload: 10000,
    features: {
      canUseAiDrafting: true,
      canUseWhiteLabel: false,
      canCompileMobile: false,
      canExportAnalytics: false,
      canInvokeWebhooks: true,
    }
  },
  pro: {
    maxUsers: 50,
    maxWorkspaces: 10,
    maxAiPayload: 50000,
    features: {
      canUseAiDrafting: true,
      canUseWhiteLabel: false,
      canCompileMobile: true,
      canExportAnalytics: true,
      canInvokeWebhooks: true,
    }
  },
  enterprise: {
    maxUsers: 'unlimited',
    maxWorkspaces: 'unlimited',
    maxAiPayload: 'custom',
    features: {
      canUseAiDrafting: true,
      canUseWhiteLabel: true,
      canCompileMobile: true,
      canExportAnalytics: true,
      canInvokeWebhooks: true,
    }
  }
};

export function useEntitlements() {
  const { currentOrganization, isInternalStaff } = useAuth();

  const entitlements = useMemo<EntitlementPayload>(() => {
    // Super admins and internal staff automatically skip all entitlement gates
    if (isInternalStaff) {
      return PLAN_MATRIX['enterprise']; // Grant canonical absolute access natively
    }

    const currentPlanId = (currentOrganization?.billing_plan as PlanType) || 'starter';
    
    // In a production env, this would merge PLAN_MATRIX[currentPlanId] with specific Feature Flag DB overrides
    return PLAN_MATRIX[currentPlanId] || PLAN_MATRIX['starter'];
  }, [currentOrganization, isInternalStaff]);

  const hasEntitlement = (featureKey: keyof EntitlementPayload['features']): boolean => {
    return entitlements.features[featureKey] === true;
  };

  const isWithinLimits = (metric: 'maxUsers' | 'maxWorkspaces' | 'maxAiPayload', currentUsage: number): boolean => {
    const limit = entitlements[metric];
    if (limit === 'unlimited' || limit === 'custom') return true;
    return currentUsage < (limit as number);
  };

  return {
    ...entitlements,
    hasEntitlement,
    isWithinLimits,
    planId: currentOrganization?.billing_plan || 'starter'
  };
}
