import { supabase } from '../supabase';
import type { BillingInterval } from '../../types/billing';

export const billingService = {
  async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly');

    if (error) throw error;
    return data || [];
  },

  async getOrganizationSubscription(organizationId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllActiveSubscriptions() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, organizations(name), subscription_plans(name, tier)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getOrganizationInvoices(organizationId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, projects(name)')
      .eq('organization_id', organizationId)
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, organizations(name), projects(name)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAllInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, organizations(name)')
      .order('issue_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createSubscription(params: {
    organization_id: string;
    plan_id: string;
    billing_cycle: BillingInterval;
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
  }) {
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', params.plan_id)
      .maybeSingle();

    if (planError) throw planError;
    if (!plan) throw new Error('Plan not found');

    const currentDate = new Date();
    const endDate = new Date(currentDate);

    if (params.billing_cycle === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const mrr = params.billing_cycle === 'monthly'
      ? plan.price_monthly
      : plan.price_yearly / 12;

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: params.organization_id,
        plan_id: params.plan_id,
        billing_cycle: params.billing_cycle,
        status: 'active',
        current_period_start: currentDate.toISOString().split('T')[0],
        current_period_end: endDate.toISOString().split('T')[0],
        mrr,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: 'active' | 'past_due' | 'cancelled' | 'paused'
  ) {
    const updates: any = { status };

    if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updates)
      .eq('id', subscriptionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createInvoice(params: {
    organization_id: string;
    project_id?: string;
    invoice_number: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax: number;
    total: number;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...params,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateInvoiceStatus(
    invoiceId: string,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  ) {
    const updates: any = { status };

    if (status === 'paid') {
      updates.paid_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async calculateMRR() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('mrr')
      .eq('status', 'active');

    if (error) throw error;

    return data.reduce((total, sub) => total + (sub.mrr || 0), 0);
  },

  async getOutstandingInvoicesTotal() {
    const { data, error } = await supabase
      .from('invoices')
      .select('total')
      .in('status', ['sent', 'overdue']);

    if (error) throw error;

    return data.reduce((total, inv) => total + (inv.total || 0), 0);
  },
};
