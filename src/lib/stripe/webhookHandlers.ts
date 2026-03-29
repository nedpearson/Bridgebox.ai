import { Logger } from '../logger';
/**
 * Stripe Webhook Handler Boundaries
 *
 * This file defines the structure for handling Stripe webhooks.
 * These handlers would typically be implemented in an Edge Function.
 *
 * IMPORTANT: This is a scaffold/boundary definition only.
 * Actual implementation should be done in a Supabase Edge Function.
 */

import { supabase } from '../supabase';
import {
  syncSubscription,
  syncInvoice,
  linkCustomerToOrganization,
  type StripeSubscriptionData,
  type StripeInvoiceData,
} from './customerSync';
import { creditsService } from '../db/credits';
import { ADD_ONS } from '../plans';
import type { AddOnType } from '../../types/billing';

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
      Logger.error('No organization_id in checkout session metadata');
      return { success: false, error: 'Missing organization_id' };
    }

    // Link customer to organization if not already linked
    await linkCustomerToOrganization(organizationId, {
      stripeCustomerId: customerId,
      email: session.customer_email,
      metadata,
    });

    // ── Provision add-on credits ──────────────────────────────────────────
    const addonType = metadata.addon_type as AddOnType | undefined;
    if (addonType) {
      const addon = ADD_ONS.find((a) => a.id === addonType);
      if (addon?.creditValue) {
        await creditsService.addCredits(
          organizationId,
          addon.creditValue * (Number(metadata.quantity ?? 1)),
          'topup_purchase',
          `Add-on purchase: ${addon.name}`,
          { addon_type: addonType, session_id: session.id }
        );
        Logger.info(`Provisioned ${addon.creditValue} credits for add-on ${addonType} to org ${organizationId}`);
      }

      // Record the purchase
      await supabase.from('bb_addon_purchases').insert({
        organization_id: organizationId,
        addon_type: addonType,
        quantity: Number(metadata.quantity ?? 1),
        unit_price: addon?.price ?? 0,
        total_paid: session.amount_total ?? 0,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: session.payment_intent ?? null,
        provisioned: true,
        provisioned_at: new Date().toISOString(),
      });
    }

    Logger.info(`Checkout completed for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle checkout.session.completed:', error);
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
      Logger.error('No organization_id in subscription metadata');
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

    Logger.info(`Subscription created for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle customer.subscription.created:', error);
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
      Logger.error('No organization_id in subscription metadata');
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

    Logger.info(`Subscription updated for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle customer.subscription.updated:', error);
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
      Logger.error('No organization_id in subscription metadata');
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

    Logger.info(`Subscription deleted for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle customer.subscription.deleted:', error);
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
      Logger.error('No organization_id in invoice metadata');
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

    // ── Renew monthly credit allowance ────────────────────────────────────
    try {
      const { data: orgData } = await supabase
        .from('bb_organizations')
        .select('billing_plan')
        .eq('id', organizationId)
        .maybeSingle();
      const planTier = orgData?.billing_plan ?? 'starter';
      await creditsService.renewMonthlyAllowance(organizationId, planTier);
      Logger.info(`Monthly credits renewed for org ${organizationId} on plan ${planTier}`);
    } catch (creditErr: any) {
      Logger.error('Failed to renew credits (non-fatal):', creditErr);
    }

    Logger.info(`Invoice paid for organization ${organizationId}`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle invoice.paid:', error);
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
      Logger.error('No organization_id in invoice metadata');
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

    await supabase.from('bb_notifications').insert({
      organization_id: organizationId,
      type: 'billing_alert',
      title: 'Payment Failed',
      message: `Your recent invoice payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
      action_links: [{ label: 'Update Billing', url: '/portal/billing' }]
    });

    Logger.error(`Invoice payment failed for organization ${organizationId}. Notification emitted.`);
    return { success: true };
  } catch (error: any) {
    Logger.error('Failed to handle invoice.payment_failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Main webhook router
 * Routes events to appropriate handlers
 */
export async function handleStripeWebhook(event: any) {
  const eventType = event.type;

  Logger.info(`Handling Stripe webhook: ${eventType}`);

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
      Logger.info(`Unhandled webhook event type: ${eventType}`);
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
