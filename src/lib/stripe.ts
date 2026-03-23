import { config } from './config';
import type { CheckoutSessionRequest, CustomerPortalRequest } from '../types/billing';

export interface StripeConfig {
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
}

export const stripeConfig: StripeConfig = {
  publicKey: config.stripe.publicKey,
};

export const isStripeConfigured = (): boolean => {
  return Boolean(stripeConfig.publicKey);
};

export const stripeHelpers = {
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  },

  formatInterval(interval: 'monthly' | 'yearly'): string {
    return interval === 'monthly' ? 'month' : 'year';
  },
};

export const createCheckoutSession = async (
  request: CheckoutSessionRequest
): Promise<{ url: string }> => {
  throw new Error('Stripe checkout not yet configured. Add STRIPE_SECRET_KEY to enable.');
};

export const createCustomerPortalSession = async (
  request: CustomerPortalRequest
): Promise<{ url: string }> => {
  throw new Error('Stripe portal not yet configured. Add STRIPE_SECRET_KEY to enable.');
};
