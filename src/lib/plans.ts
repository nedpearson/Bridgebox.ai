import type {
  Plan,
  FeatureKey,
  AddOnDefinition,
  AddOnType,
  PlanTier,
} from "../types/billing";

// ─────────────────────────────────────────────────────────────────────────────
// BRIDGEBOX PLAN DEFINITIONS — Voice-to-App Edition
// ─────────────────────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: "starter",
    tier: "starter",
    name: "Starter",
    tagline:
      "Get your software vision out of your head and into a working plan.",
    description:
      "For businesses beginning to capture and design their custom platform.",
    pricing: { monthly: 497, yearly: 4470 },
    ctaLabel: "Start Building",
    highlighted: false,
    badge: undefined,
    monthlyCredits: 50,
    maxWorkspaces: 1,
    maxUsersPerWorkspace: 5,
    maxRecordingsPerMonth: 3,
    maxIntegrations: 2,
    entitlements: [
      "voice_to_app",
      "screenshot_analysis",
      "blueprint_generation",
      "export_blueprint",
    ],
    features: [
      { name: "50 AI Credits / month", included: true, limit: 50 },
      { name: "Voice-to-App Discovery", included: true },
      { name: "Screenshot Analysis (up to 5/mo)", included: true, limit: 5 },
      { name: "3 Screen Recordings / month", included: true, limit: 3 },
      { name: "1 Active Workspace", included: true, limit: 1 },
      { name: "Blueprint Generation", included: true },
      { name: "Export Software Blueprint", included: true },
      { name: "Up to 5 Team Members", included: true, limit: 5 },
      { name: "2 Integrations", included: true, limit: 2 },
      { name: "Email Support", included: true },
      { name: "Screen Recording Analysis", included: false },
      { name: "Workspace Learning AI", included: false },
      { name: "Reusable Feature Packs", included: false },
      { name: "Multi-Workspace Management", included: false },
    ],
  },
  {
    id: "growth",
    tier: "growth",
    name: "Growth",
    tagline:
      "Actively shape a custom platform built around your exact workflow.",
    description:
      "For businesses customizing software around their specific operations.",
    pricing: { monthly: 1497, yearly: 13470 },
    ctaLabel: "Grow Your Platform",
    highlighted: true,
    badge: "Most Popular",
    monthlyCredits: 200,
    maxWorkspaces: 3,
    maxUsersPerWorkspace: 25,
    maxRecordingsPerMonth: 15,
    maxIntegrations: 8,
    entitlements: [
      "voice_to_app",
      "screen_recording_analysis",
      "screenshot_analysis",
      "blueprint_generation",
      "workspace_learning_ai",
      "reusable_feature_packs",
      "advanced_integrations",
      "export_blueprint",
      "analytics_suite",
    ],
    features: [
      { name: "200 AI Credits / month", included: true, limit: 200 },
      { name: "Voice-to-App Discovery", included: true },
      { name: "Screen Recording Analysis", included: true },
      { name: "Screenshot Analysis (unlimited)", included: true },
      { name: "15 Screen Recordings / month", included: true, limit: 15 },
      { name: "Workspace Learning AI", included: true },
      { name: "3 Workspaces", included: true, limit: 3 },
      { name: "Reusable Feature Packs", included: true },
      { name: "Advanced Integrations (up to 8)", included: true, limit: 8 },
      { name: "Up to 25 Team Members", included: true, limit: 25 },
      { name: "Analytics Suite", included: true },
      { name: "Priority Support", included: true },
      { name: "Multi-Workspace Management", included: false },
      { name: "Workspace Merge & Transplant", included: false },
      { name: "White-Glove Onboarding", included: false },
    ],
  },
  {
    id: "pro",
    tier: "pro",
    name: "Pro",
    tagline:
      "Run multiple workflows, reusable modules, and deeper AI-driven software evolution.",
    description:
      "For operators managing multiple clients or complex multi-workspace deployments.",
    pricing: { monthly: 2997, yearly: 26970 },
    ctaLabel: "Go Pro",
    highlighted: false,
    badge: "Operator Tier",
    monthlyCredits: 600,
    maxWorkspaces: 10,
    maxUsersPerWorkspace: 100,
    maxRecordingsPerMonth: 50,
    maxIntegrations: 25,
    entitlements: [
      "voice_to_app",
      "screen_recording_analysis",
      "screenshot_analysis",
      "blueprint_generation",
      "workspace_learning_ai",
      "reusable_feature_packs",
      "workspace_merge",
      "advanced_integrations",
      "export_blueprint",
      "premium_admin_controls",
      "multi_workspace",
      "implementation_queue",
      "analytics_suite",
      "predictive_recommendations",
      "white_glove_onboarding",
      "priority_support",
    ],
    features: [
      { name: "600 AI Credits / month", included: true, limit: 600 },
      { name: "Everything in Growth", included: true },
      { name: "Up to 10 Workspaces", included: true, limit: 10 },
      { name: "50 Screen Recordings / month", included: true, limit: 50 },
      { name: "Workspace Merge & Transplant", included: true },
      { name: "Predictive AI Recommendations", included: true },
      { name: "Implementation Queue Controls", included: true },
      { name: "Premium Admin Controls", included: true },
      { name: "Multi-Workspace Management", included: true },
      { name: "White-Glove Onboarding", included: true },
      { name: "Unlimited Integrations", included: true },
      { name: "Up to 100 Users per Workspace", included: true, limit: 100 },
      { name: "Priority Support", included: true },
    ],
  },
  {
    id: "enterprise",
    tier: "enterprise",
    name: "Enterprise",
    tagline:
      "Governance, scale, and a custom rollout across your organization.",
    description:
      "For organizations needing custom limits, audit controls, SSO, and dedicated support.",
    pricing: {},
    ctaLabel: "Contact Sales",
    highlighted: false,
    badge: "Custom Pricing",
    monthlyCredits: -1, // unlimited
    maxWorkspaces: -1,
    maxUsersPerWorkspace: -1,
    maxRecordingsPerMonth: -1,
    maxIntegrations: -1,
    entitlements: [
      "voice_to_app",
      "screen_recording_analysis",
      "screenshot_analysis",
      "blueprint_generation",
      "workspace_learning_ai",
      "reusable_feature_packs",
      "workspace_merge",
      "advanced_integrations",
      "export_blueprint",
      "premium_admin_controls",
      "multi_workspace",
      "white_glove_onboarding",
      "priority_support",
      "custom_branding",
      "sso_ready",
      "audit_controls",
      "predictive_recommendations",
      "implementation_queue",
      "analytics_suite",
    ],
    features: [
      { name: "Unlimited AI Credits", included: true },
      { name: "Custom contract pricing", included: true },
      { name: "Unlimited Workspaces", included: true },
      { name: "Unlimited Screen Recordings", included: true },
      { name: "SSO-Ready Architecture", included: true },
      { name: "Audit Controls & Governance", included: true },
      { name: "Custom Branding", included: true },
      { name: "Premium Onboarding Package", included: true },
      { name: "Dedicated Support Specialist", included: true },
      { name: "Enterprise SLAs", included: true },
      { name: "Custom AI Model Tuning", included: true },
      { name: "Advanced Analytics & Reporting", included: true },
    ],
  },
];

// ─── Add-On Definitions ────────────────────────────────────────────────────────

export const ADD_ONS: AddOnDefinition[] = [
  {
    id: "credit_pack_100",
    name: "100 AI Credits",
    description:
      "Top up your workspace with 100 additional AI credits. Credits expire 90 days after purchase.",
    price: 9900, // $99
    creditValue: 100,
    category: "credits",
  },
  {
    id: "credit_pack_500",
    name: "500 AI Credits",
    description:
      "Best value — 500 credits for large discovery sessions or multi-client work.",
    price: 39900, // $399
    creditValue: 500,
    category: "credits",
  },
  {
    id: "credit_pack_1000",
    name: "1,000 AI Credits",
    description:
      "Power user pack — 1,000 credits for enterprise-scale discovery and blueprint work.",
    price: 69900, // $699
    creditValue: 1000,
    category: "credits",
  },
  {
    id: "recording_pack_10",
    name: "10 Extra Recordings",
    description:
      "Add 10 additional screen recording analyses to your current billing period.",
    price: 4900, // $49
    recordingValue: 10,
    category: "recordings",
  },
  {
    id: "onboarding_package",
    name: "Premium Onboarding",
    description:
      "Guided 3-session onboarding with a Bridgebox specialist to capture your full software vision.",
    price: 149900, // $1,499
    category: "services",
  },
  {
    id: "migration_package",
    name: "Data Migration Service",
    description:
      "Full data migration from your existing systems into your new custom platform.",
    price: 299900, // $2,999
    category: "services",
  },
  {
    id: "setup_package",
    name: "Workspace Setup",
    description:
      "White-glove workspace configuration, intelligence profile setup, and team onboarding.",
    price: 99900, // $999
    category: "services",
  },
  {
    id: "custom_feature_sprint",
    name: "Custom Feature Sprint",
    description:
      "Dedicated 2-week implementation sprint for a specific feature or workflow.",
    price: 499900, // $4,999
    category: "services",
  },
  {
    id: "priority_support_month",
    name: "Priority Support (1 Month)",
    description: "Direct Slack access and same-day response SLA for 30 days.",
    price: 49900, // $499
    category: "support",
  },
  {
    id: "workspace_intelligence_upgrade",
    name: "Advanced Intelligence Upgrade",
    description:
      "Unlock predictive AI recommendations for a single workspace for 3 months.",
    price: 29900, // $299
    category: "services",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getPlanById = (id: string): Plan | undefined =>
  PLANS.find((plan) => plan.id === id);

export const getPlanByTier = (tier: string): Plan | undefined =>
  PLANS.find((plan) => plan.tier === tier);

export const getAddOnById = (id: AddOnType): AddOnDefinition | undefined =>
  ADD_ONS.find((a) => a.id === id);

export const formatPlanPrice = (
  plan: Plan,
  interval: "monthly" | "yearly" = "monthly",
): string => {
  const price = plan.pricing[interval];
  if (!price) return "Custom";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const formatAddOnPrice = (addon: AddOnDefinition): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(addon.price / 100);
};

export const getPlanTierOrder = (): PlanTier[] => [
  "starter",
  "growth",
  "pro",
  "enterprise",
];

export const isPlanHigherThan = (a: string, b: string): boolean => {
  const order = getPlanTierOrder();
  return order.indexOf(a as any) > order.indexOf(b as any);
};
