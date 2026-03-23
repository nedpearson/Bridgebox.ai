/**
 * Stripe Webhook Handler Boundaries
 *
 * This file defines the structure for handling Stripe webhooks.
 * These handlers would typically be implemented in an Edge Function.
 *
 * IMPORTANT: This is a scaffold/boundary definition only.
 * Actual implementation should be done in a Supabase Edge Function.
 */

import {
  syncSubscription,
  syncInvoice,
  linkCustomerToOrganization,
  type StripeSubscriptionData,
  type StripeInvoiceData,
} from './customerSync';

/**
 * Handle checkout.session.completed event
 * Triggered when a customer completes a checkout
 */
export async function handleCheckoutCompleted(event: any) {
  const session = event.data.object;

  try {
    // Extract data from session
    const customerId = session.customer;
    const subscriptionId = session.subscription;
    const metadata = session.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in checkout session metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    // Link customer to organization if not already linked
    await linkCustomerToOrganization(organizationId, {
      stripeCustomerId: customerId,
      email: session.customer_email,
      metadata,
    });

    console.log(`Checkout completed for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle checkout.session.completed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle customer.subscription.created event
 * Triggered when a new subscription is created
 */
export async function handleSubscriptionCreated(event: any) {
  const subscription = event.data.object;

  try {
    const metadata = subscription.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in subscription metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    const subscriptionData: StripeSubscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status: subscription.status,
      plan: subscription.items.data[0]?.price?.lookup_key || 'unknown',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      metadata: subscription.metadata,
    };

    await syncSubscription(organizationId, subscriptionData);

    console.log(`Subscription created for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle customer.subscription.created:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle customer.subscription.updated event
 * Triggered when subscription is modified (status change, plan change, etc.)
 */
export async function handleSubscriptionUpdated(event: any) {
  const subscription = event.data.object;

  try {
    const metadata = subscription.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in subscription metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    const subscriptionData: StripeSubscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status: subscription.status,
      plan: subscription.items.data[0]?.price?.lookup_key || 'unknown',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      trialStart: subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
      metadata: subscription.metadata,
    };

    await syncSubscription(organizationId, subscriptionData);

    console.log(`Subscription updated for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle customer.subscription.updated:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle customer.subscription.deleted event
 * Triggered when subscription is canceled/deleted
 */
export async function handleSubscriptionDeleted(event: any) {
  const subscription = event.data.object;

  try {
    const metadata = subscription.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in subscription metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    const subscriptionData: StripeSubscriptionData = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer,
      status: 'canceled',
      plan: subscription.items.data[0]?.price?.lookup_key || 'unknown',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: true,
      canceledAt: new Date(),
      trialStart: null,
      trialEnd: null,
      metadata: subscription.metadata,
    };

    await syncSubscription(organizationId, subscriptionData);

    console.log(`Subscription deleted for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle customer.subscription.deleted:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle invoice.paid event
 * Triggered when an invoice payment succeeds
 */
export async function handleInvoicePaid(event: any) {
  const invoice = event.data.object;

  try {
    const metadata = invoice.subscription_details?.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in invoice metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    const invoiceData: StripeInvoiceData = {
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription || null,
      status: 'paid',
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
      invoiceNumber: invoice.number || null,
      periodStart: invoice.period_start
        ? new Date(invoice.period_start * 1000)
        : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: new Date(invoice.status_transitions.paid_at * 1000),
    };

    await syncInvoice(organizationId, invoiceData);

    console.log(`Invoice paid for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle invoice.paid:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle invoice.payment_failed event
 * Triggered when an invoice payment fails
 */
export async function handleInvoicePaymentFailed(event: any) {
  const invoice = event.data.object;

  try {
    const metadata = invoice.subscription_details?.metadata || {};
    const organizationId = metadata.organization_id;

    if (!organizationId) {
      console.error('No organization_id in invoice metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    const invoiceData: StripeInvoiceData = {
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      stripeSubscriptionId: invoice.subscription || null,
      status: 'payment_failed',
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
      invoiceNumber: invoice.number || null,
      periodStart: invoice.period_start
        ? new Date(invoice.period_start * 1000)
        : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: null,
    };

    await syncInvoice(organizationId, invoiceData);

    // TODO: Send notification to organization about payment failure
    console.log(`Invoice payment failed for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to handle invoice.payment_failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main webhook router
 * Routes events to appropriate handlers
 */
export async function handleStripeWebhook(event: any) {
  const eventType = event.type;

  console.log(`Handling Stripe webhook: ${eventType}`);

  switch (eventType) {
    case 'checkout.session.completed':
      return handleCheckoutCompleted(event);

    case 'customer.subscription.created':
      return handleSubscriptionCreated(event);

    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event);

    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event);

    case 'invoice.paid':
      return handleInvoicePaid(event);

    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event);

    default:
      console.log(`Unhandled webhook event type: ${eventType}`);
      return { success: true, message: 'Event type not handled' };
  }
}

/**
 * Edge Function implementation scaffold
 *
 * To implement as a Supabase Edge Function:
 *
 * 1. Create: supabase/functions/stripe-webhooks/index.ts
 * 2. Verify webhook signature using Stripe library
 * 3. Parse webhook event
 * 4. Call handleStripeWebhook(event)
 * 5. Return appropriate response
 *
 * Example Edge Function structure:
 *
 * ```typescript
 * import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
 * import Stripe from 'https://esm.sh/stripe@12.0.0'
 *
 * const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
 *   apiVersion: '2023-10-16',
 * })
 *
 * serve(async (req) => {
 *   const signature = req.headers.get('stripe-signature')
 *   const body = await req.text()
 *
 *   try {
 *     const event = stripe.webhooks.constructEvent(
 *       body,
 *       signature,
 *       Deno.env.get('STRIPE_WEBHOOK_SECRET')
 *     )
 *
 *     const result = await handleStripeWebhook(event)
 *
 *     return new Response(JSON.stringify(result), {
 *       status: 200,
 *       headers: { 'Content-Type': 'application/json' }
 *     })
 *   } catch (err) {
 *     return new Response(JSON.stringify({ error: err.message }), {
 *       status: 400
 *     })
 *   }
 * })
 * ```
 */
