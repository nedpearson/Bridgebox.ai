import { useState, useEffect } from 'react';
import { billingService } from '../lib/db';
import type { SubscriptionPlan, Subscription, Invoice } from '../types/database';

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      setError(null);
      const data = await billingService.getSubscriptionPlans();
      setPlans(data as SubscriptionPlan[]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { plans, loading, error, reload: loadPlans };
}

export function useOrganizationSubscription(organizationId: string | undefined) {
  const [subscription, setSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    loadSubscription();
  }, [organizationId]);

  async function loadSubscription() {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await billingService.getOrganizationSubscription(organizationId);
      setSubscription(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { subscription, loading, error, reload: loadSubscription };
}

export function useOrganizationInvoices(organizationId: string | undefined) {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    loadInvoices();
  }, [organizationId]);

  async function loadInvoices() {
    if (!organizationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await billingService.getOrganizationInvoices(organizationId);
      setInvoices(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { invoices, loading, error, reload: loadInvoices };
}

export function useInvoice(id: string | undefined) {
  const [invoice, setInvoice] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    loadInvoice();
  }, [id]);

  async function loadInvoice() {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await billingService.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { invoice, loading, error, reload: loadInvoice };
}
