// ─────────────────────────────────────────────────────────────────────────────
// BRIDGEBOX BILLING TYPES
// Covers subscriptions, invoices, AI credits, entitlements, and usage metering
// ─────────────────────────────────────────────────────────────────────────────

export type BillingInterval = "monthly" | "yearly";
export type PlanTier = "starter" | "growth" | "pro" | "enterprise" | "custom";

// ─── Plan Structure ────────────────────────────────────────────────────────

export interface StripePriceConfig {
  monthly?: string;
  yearly?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
}

export interface Plan {
  id: string;
  tier: PlanTier;
  name: string;
  tagline: string;
  description: string;
  features: PlanFeature[];
  pricing: {
    monthly?: number;
    yearly?: number;
  };
  stripePrices?: StripePriceConfig;
  ctaLabel: string;
  highlighted: boolean;
  badge?: string;
  // Credit allocations
  monthlyCredits: number; // AI credits included per month
  maxWorkspaces: number; // workspace limit
  maxUsersPerWorkspace: number; // seat limit
  maxRecordingsPerMonth: number; // recording uploads per month
  maxIntegrations: number; // connected integrations
  // Entitlement keys unlocked by this plan
  entitlements: FeatureKey[];
}

// ─── Feature Entitlements ────────────────────────────────────────────────────

export type FeatureKey =
  | "voice_to_app"
  | "screen_recording_analysis"
  | "screenshot_analysis"
  | "blueprint_generation"
  | "workspace_learning_ai"
  | "reusable_feature_packs"
  | "workspace_merge"
  | "advanced_integrations"
  | "export_blueprint"
  | "premium_admin_controls"
  | "multi_workspace"
  | "white_glove_onboarding"
  | "priority_support"
  | "custom_branding"
  | "sso_ready"
  | "audit_controls"
  | "predictive_recommendations"
  | "implementation_queue"
  | "analytics_suite";

export type EntitlementMap = Record<FeatureKey, boolean>;

export interface FeatureEntitlementOverride {
  id: string;
  organization_id: string;
  feature_key: FeatureKey;
  granted: boolean; // true = grant, false = revoke
  granted_by: string; // admin user id
  reason?: string;
  expires_at?: string;
  created_at: string;
}

// ─── AI Credit System ────────────────────────────────────────────────────────

export type CreditEventType =
  | "voice_blueprint_request" // 5 credits
  | "recording_analysis" // 8 credits
  | "screenshot_analysis" // 3 credits
  | "blueprint_generation" // 10 credits
  | "workspace_intelligence_run" // 15 credits
  | "roadmap_generation" // 8 credits
  | "refinement_cycle" // 3 credits
  | "integration_setup_ai" // 5 credits
  | "monthly_allowance" // credits added (positive)
  | "topup_purchase" // credits purchased (positive)
  | "admin_adjustment" // manual admin grant
  | "expiry"; // end-of-month expiry (negative)

export const CREDIT_COSTS: Record<string, number> = {
  voice_blueprint_request: 5,
  recording_analysis: 8,
  screenshot_analysis: 3,
  blueprint_generation: 10,
  workspace_intelligence_run: 15,
  roadmap_generation: 8,
  refinement_cycle: 3,
  integration_setup_ai: 5,
};

export const CREDIT_LABELS: Record<string, string> = {
  voice_blueprint_request: "Voice Blueprint Request",
  recording_analysis: "Recording Analysis",
  screenshot_analysis: "Screenshot Analysis",
  blueprint_generation: "Blueprint Generation",
  workspace_intelligence_run: "Workspace Intelligence Run",
  roadmap_generation: "Roadmap Generation",
  refinement_cycle: "Refinement Cycle",
  integration_setup_ai: "Integration Setup AI",
  monthly_allowance: "Monthly Allowance",
  topup_purchase: "Credit Top-Up",
  admin_adjustment: "Admin Adjustment",
  expiry: "Monthly Expiry",
};

export interface CreditWallet {
  id: string;
  organization_id: string;
  balance: number; // current available credits
  monthly_allowance: number; // credits included by plan per month
  lifetime_earned: number;
  lifetime_spent: number;
  period_start: string; // current billing period
  period_end: string;
  updated_at: string;
  created_at: string;
}

export interface CreditLedgerEntry {
  id: string;
  organization_id: string;
  user_id?: string;
  event_type: CreditEventType;
  delta: number; // positive = earned, negative = consumed
  balance_after: number;
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// ─── Usage Metering ───────────────────────────────────────────────────────────

export type UsageMetricType =
  | "voice_request"
  | "recording_upload"
  | "recording_analyzed"
  | "screenshot_analyzed"
  | "blueprint_generated"
  | "refinement_processed"
  | "integration_connected"
  | "workspace_created"
  | "ai_credit_consumed"
  | "storage_bytes";

export interface UsageEvent {
  id: string;
  organization_id: string;
  workspace_id?: string;
  user_id?: string;
  metric_type: UsageMetricType;
  quantity: number;
  credit_cost?: number;
  is_overage: boolean; // true if beyond plan limit
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UsageSummary {
  period_start: string;
  period_end: string;
  by_type: Record<UsageMetricType, number>;
  total_credits_consumed: number;
  credits_remaining: number;
  overage_events: number;
}

// ─── Add-Ons ─────────────────────────────────────────────────────────────────

export type AddOnType =
  | "credit_pack_100"
  | "credit_pack_500"
  | "credit_pack_1000"
  | "recording_pack_10"
  | "onboarding_package"
  | "migration_package"
  | "setup_package"
  | "custom_feature_sprint"
  | "priority_support_month"
  | "workspace_intelligence_upgrade";

export interface AddOnDefinition {
  id: AddOnType;
  name: string;
  description: string;
  price: number; // one-time USD cents
  creditValue?: number; // credits granted
  recordingValue?: number;
  category: "credits" | "recordings" | "services" | "support";
  stripePriceId?: string;
}

export interface AddOnPurchase {
  id: string;
  organization_id: string;
  addon_type: AddOnType;
  quantity: number;
  unit_price: number; // cents
  total_paid: number; // cents
  stripe_payment_intent_id?: string;
  provisioned: boolean;
  provisioned_at?: string;
  created_at: string;
}

// ─── Service Packages ─────────────────────────────────────────────────────────

export type ServicePackageType =
  | "onboarding"
  | "migration"
  | "setup"
  | "custom_sprint"
  | "integration_setup"
  | "optimization"
  | "ai_workflow_tuning"
  | "managed_service";

export type ServiceOrderStatus =
  | "proposed"
  | "approved"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  package_type: ServicePackageType;
  price_one_time?: number;
  price_recurring_monthly?: number;
  estimated_hours?: number;
  deliverables: string[];
  is_active: boolean;
}

export interface ServiceOrder {
  id: string;
  organization_id: string;
  package_id: string;
  status: ServiceOrderStatus;
  assigned_to?: string;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  one_time_charge?: number;
  recurring_charge?: number;
  upsell_opportunity?: string;
  created_at: string;
  updated_at: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: "active" | "past_due" | "cancelled" | "paused" | "trialing";
  billing_cycle: BillingInterval;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  mrr: number;
  started_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  organization_id: string;
  project_id?: string;
  stripe_invoice_id?: string;
  invoice_number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issue_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ─── Billing Customer ─────────────────────────────────────────────────────────

export interface BillingCustomer {
  id: string;
  organization_id: string;
  stripe_customer_id?: string;
  email: string;
  name: string;
  payment_method_attached: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Stripe Request Types ──────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  planId: string;
  interval: BillingInterval;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CustomerPortalRequest {
  organizationId: string;
  returnUrl: string;
}

export interface AddOnCheckoutRequest {
  addOnType: AddOnType;
  quantity: number;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}

// ─── Upgrade Recommendation ───────────────────────────────────────────────────

export interface UpgradeRecommendation {
  id: string;
  organization_id: string;
  trigger:
    | "low_credits"
    | "locked_feature"
    | "recording_limit"
    | "workspace_limit"
    | "high_activity";
  feature_attempted?: FeatureKey;
  recommended_plan: PlanTier;
  dismissed: boolean;
  converted: boolean;
  created_at: string;
}
