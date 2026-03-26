/**
 * BRIDGEBOX AUTUMN BILLING CLIENT
 *
 * Autumn is the usage-based billing control layer for Bridgebox.
 *
 * Architecture note:
 * - `autumn-js` is a REACT SDK that wraps calls to YOUR backend (not Autumn's API directly)
 * - The React client (createAutumnClient) → your backend → Autumn API
 * - Secret key operations (check, track) MUST run server-side (Supabase Edge Functions)
 * - The publishable key is used to identify your Autumn project in client → backend calls
 *
 * The AutumnProvider wraps the app and the hooks (useAutumn, useCustomer) expose state.
 */

import { createAutumnClient } from 'autumn-js/react';
import { config } from '../config';

// ─── Backend URL ────────────────────────────────────────────────────────────
// Autumn's React SDK makes calls to YOUR backend, which then forwards to Autumn.
// In Bridgebox this is a Supabase Edge Function at /functions/v1/autumn
const AUTUMN_BACKEND_URL = `${config.supabase.url}/functions/v1/autumn`;

// ─── Client singleton ──────────────────────────────────────────────────────
export const autumnClient = createAutumnClient({
  backendUrl: AUTUMN_BACKEND_URL,
  pathPrefix: '',            // functions/v1/autumn is the full path
  includeCredentials: true,  // send Supabase auth cookie along
});

// ─── Feature IDs ─────────────────────────────────────────────────────────────
// These must match the feature IDs you define in the Autumn dashboard
export const AUTUMN_FEATURES = {
  AI_TOKENS:       'ai_tokens',
  WORKFLOWS:       'workflows',
  INTEGRATIONS:    'integrations',
  STORAGE_GB:      'storage_gb',
  TEAM_MEMBERS:    'team_members',
  CUSTOM_FEATURES: 'custom_features',
  SUPPORT_AGENT:   'support_agent',
} as const;

export type AutumnFeatureId = typeof AUTUMN_FEATURES[keyof typeof AUTUMN_FEATURES];

// ─── Product IDs ─────────────────────────────────────────────────────────────
// These must match the plan IDs in your Autumn dashboard
export const AUTUMN_PRODUCTS = {
  STARTER:    'bridgebox_starter',
  STANDARD:   'bridgebox_standard',
  GROWTH:     'bridgebox_growth',
  SCALE:      'bridgebox_scale',
  ENTERPRISE: 'bridgebox_enterprise',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Attach a customer to a product/plan and get the checkout URL.
 * Used during onboarding to subscribe the org to their tier.
 */
export async function attachCustomerToProduct(
  planId: string,
  options?: { successUrl?: string },
): Promise<{ paymentUrl?: string; success: boolean }> {
  try {
    const result = await autumnClient.attach({
      planId,
      successUrl: options?.successUrl,
    });
    return { paymentUrl: result.paymentUrl ?? undefined, success: true };
  } catch (err: any) {
    console.error('[Autumn] attachCustomerToProduct failed:', err);
    return { success: false };
  }
}

/**
 * Open the customer billing portal (manage subscription, payment methods, invoices).
 */
export async function openBillingPortal(
  returnUrl?: string,
): Promise<{ url?: string; success: boolean }> {
  try {
    const result = await autumnClient.openCustomerPortal({
      returnUrl: returnUrl ?? window.location.href,
    });
    return { url: (result as any).url ?? undefined, success: true };
  } catch (err: any) {
    console.error('[Autumn] openBillingPortal failed:', err);
    return { success: false };
  }
}

/**
 * Fetch the list of available plans to display a pricing page.
 */
export async function listAutumnPlans(customerId?: string) {
  try {
    return await autumnClient.listPlans({ customerId });
  } catch (err) {
    console.warn('[Autumn] listPlans failed:', err);
    return { list: [] };
  }
}

/**
 * Map a Bridgebox organization ID to an Autumn customer ID.
 * Autumn uses your own IDs as customer identifiers.
 */
export function orgToCustomerId(organizationId: string): string {
  return `org_${organizationId}`;
}
