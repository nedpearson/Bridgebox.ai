export type BillingInterval = 'monthly' | 'yearly';
export type PlanTier = 'starter' | 'growth' | 'enterprise' | 'custom';

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
  description: string;
  features: PlanFeature[];
  pricing: {
    monthly?: number;
    yearly?: number;
  };
  stripePrices?: StripePriceConfig;
  ctaLabel: string;
  highlighted: boolean;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: 'active' | 'past_due' | 'cancelled' | 'paused';
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

export interface Invoice {
  id: string;
  organization_id: string;
  project_id?: string;
  stripe_invoice_id?: string;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
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
