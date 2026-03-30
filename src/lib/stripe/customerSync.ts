import { supabase } from "../supabase";

export interface StripeCustomerData {
  stripeCustomerId: string;
  email: string;
  name?: string;
  metadata?: Record<string, any>;
}

export interface StripeSubscriptionData {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: string;
  plan: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  metadata?: Record<string, any>;
}

export interface StripeInvoiceData {
  stripeInvoiceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  status: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  invoicePdf?: string | null;
  hostedInvoiceUrl?: string | null;
  invoiceNumber?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
  dueDate?: Date | null;
  paidAt?: Date | null;
}

/**
 * Link a Stripe customer to an organization
 * Prevents duplicate customer creation
 */
export async function linkCustomerToOrganization(
  organizationId: string,
  customerData: StripeCustomerData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if customer already linked to another organization
    const { data: existing } = await supabase
      .from("bb_organizations")
      .select("id, name")
      .eq("stripe_customer_id", customerData.stripeCustomerId)
      .neq("id", organizationId)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: `Customer already linked to organization: ${existing.name}`,
      };
    }

    // Link customer to organization
    const { error: updateError } = await supabase
      .from("bb_organizations")
      .update({
        stripe_customer_id: customerData.stripeCustomerId,
        billing_email: customerData.email,
        billing_synced_at: new Date().toISOString(),
      })
      .eq("id", organizationId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error: any) {
    console.error("Failed to link customer to organization:", error);
    return {
      success: false,
      error: error.message || "Failed to link customer",
    };
  }
}

/**
 * Get or create Stripe customer ID for an organization
 */
export async function getOrganizationStripeCustomer(
  organizationId: string,
): Promise<{ customerId?: string; error?: string }> {
  try {
    const { data: org, error } = await supabase
      .from("bb_organizations")
      .select("stripe_customer_id, name, billing_email")
      .eq("id", organizationId)
      .single();

    if (error) throw error;

    return { customerId: org.stripe_customer_id || undefined };
  } catch (error: any) {
    console.error("Failed to get organization stripe customer:", error);
    return { error: error.message || "Failed to get customer" };
  }
}

/**
 * Sync subscription data from Stripe to database
 * Called from webhook or manual sync
 */
export async function syncSubscription(
  organizationId: string,
  subscriptionData: StripeSubscriptionData,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Upsert to stripe_subscriptions table
    const { error: upsertError } = await supabase
      .from("stripe_subscriptions")
      .upsert(
        {
          organization_id: organizationId,
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          status: subscriptionData.status,
          plan: subscriptionData.plan,
          current_period_start:
            subscriptionData.currentPeriodStart.toISOString(),
          current_period_end: subscriptionData.currentPeriodEnd.toISOString(),
          cancel_at_period_end: subscriptionData.cancelAtPeriodEnd,
          canceled_at: subscriptionData.canceledAt?.toISOString() || null,
          trial_start: subscriptionData.trialStart?.toISOString() || null,
          trial_end: subscriptionData.trialEnd?.toISOString() || null,
          metadata: subscriptionData.metadata || {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "stripe_subscription_id",
        },
      );

    if (upsertError) throw upsertError;

    // Trigger will automatically sync to organization table

    return { success: true };
  } catch (error: any) {
    console.error("Failed to sync subscription:", error);
    return {
      success: false,
      error: error.message || "Failed to sync subscription",
    };
  }
}

/**
 * Sync invoice data from Stripe to database
 */
export async function syncInvoice(
  organizationId: string,
  invoiceData: StripeInvoiceData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: upsertError } = await supabase
      .from("stripe_invoices")
      .upsert(
        {
          organization_id: organizationId,
          stripe_invoice_id: invoiceData.stripeInvoiceId,
          stripe_customer_id: invoiceData.stripeCustomerId,
          stripe_subscription_id: invoiceData.stripeSubscriptionId || null,
          status: invoiceData.status,
          amount_due: invoiceData.amountDue,
          amount_paid: invoiceData.amountPaid,
          currency: invoiceData.currency,
          invoice_pdf: invoiceData.invoicePdf || null,
          hosted_invoice_url: invoiceData.hostedInvoiceUrl || null,
          invoice_number: invoiceData.invoiceNumber || null,
          period_start: invoiceData.periodStart?.toISOString() || null,
          period_end: invoiceData.periodEnd?.toISOString() || null,
          due_date: invoiceData.dueDate?.toISOString() || null,
          paid_at: invoiceData.paidAt?.toISOString() || null,
        },
        {
          onConflict: "stripe_invoice_id",
        },
      );

    if (upsertError) throw upsertError;

    return { success: true };
  } catch (error: any) {
    console.error("Failed to sync invoice:", error);
    return {
      success: false,
      error: error.message || "Failed to sync invoice",
    };
  }
}

/**
 * Get subscription status for an organization
 */
export async function getOrganizationSubscription(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from("stripe_subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { subscription: data, error: null };
  } catch (error: any) {
    console.error("Failed to get organization subscription:", error);
    return {
      subscription: null,
      error: error.message || "Failed to get subscription",
    };
  }
}

/**
 * Get invoice history for an organization
 */
export async function getOrganizationInvoices(organizationId: string) {
  try {
    const { data, error } = await supabase
      .from("stripe_invoices")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { invoices: data || [], error: null };
  } catch (error: any) {
    console.error("Failed to get organization invoices:", error);
    return {
      invoices: [],
      error: error.message || "Failed to get invoices",
    };
  }
}

/**
 * Check if organization has active subscription
 */
export async function hasActiveSubscription(
  organizationId: string,
): Promise<boolean> {
  try {
    const { data: org } = await supabase
      .from("bb_organizations")
      .select("subscription_status, is_enterprise_client")
      .eq("id", organizationId)
      .single();

    if (!org) return false;

    // Enterprise clients always have access
    if (org.is_enterprise_client) return true;

    // Check for active subscription status
    return (
      org.subscription_status === "active" ||
      org.subscription_status === "trialing"
    );
  } catch (error) {
    console.error("Failed to check subscription status:", error);
    return false;
  }
}

/**
 * Get billing plan name for display
 */
export function getBillingPlanDisplay(plan: string | null): string {
  if (!plan) return "Free";

  const planMap: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    professional: "Professional",
    enterprise: "Enterprise",
    custom: "Custom",
  };

  return planMap[plan] || plan;
}

/**
 * Get subscription status display info
 */
export function getSubscriptionStatusInfo(status: string | null): {
  label: string;
  color: string;
  description: string;
} {
  if (!status) {
    return {
      label: "No Subscription",
      color: "gray",
      description: "Not subscribed to any plan",
    };
  }

  const statusMap: Record<
    string,
    { label: string; color: string; description: string }
  > = {
    active: {
      label: "Active",
      color: "green",
      description: "Subscription is active and current",
    },
    trialing: {
      label: "Trial",
      color: "blue",
      description: "In trial period",
    },
    past_due: {
      label: "Past Due",
      color: "yellow",
      description: "Payment failed, retrying",
    },
    canceled: {
      label: "Canceled",
      color: "red",
      description: "Subscription has been canceled",
    },
    incomplete: {
      label: "Incomplete",
      color: "yellow",
      description: "Awaiting payment confirmation",
    },
    incomplete_expired: {
      label: "Expired",
      color: "gray",
      description: "Payment not completed in time",
    },
    unpaid: {
      label: "Unpaid",
      color: "red",
      description: "Payment failed after retries",
    },
    paused: {
      label: "Paused",
      color: "gray",
      description: "Subscription is temporarily paused",
    },
  };

  return (
    statusMap[status] || {
      label: status,
      color: "gray",
      description: "Unknown status",
    }
  );
}
