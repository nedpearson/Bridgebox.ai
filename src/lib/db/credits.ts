// ─────────────────────────────────────────────────────────────────────────────
// BRIDGEBOX CREDIT SERVICE
// Manages AI credit wallets, ledger entries, and top-up provisioning.
// Tables: bb_credit_wallets, bb_credit_ledger
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../supabase';
import type { CreditWallet, CreditLedgerEntry, CreditEventType } from '../../types/billing';
import { CREDIT_COSTS, CREDIT_LABELS } from '../../types/billing';
import { getCreditAllowance } from '../entitlements';

export const creditsService = {

  // ─── Wallet ────────────────────────────────────────────────────────────────

  async getWallet(organizationId: string): Promise<CreditWallet | null> {
    const { data, error } = await supabase
      .from('bb_credit_wallets')
      .select('*')
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async ensureWallet(organizationId: string, planTier = 'starter'): Promise<CreditWallet> {
    const existing = await this.getWallet(organizationId);
    if (existing) return existing;

    const allowance = getCreditAllowance(planTier);
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const { data, error } = await supabase
      .from('bb_credit_wallets')
      .insert({
        organization_id: organizationId,
        balance: allowance > 0 ? allowance : 0,
        monthly_allowance: allowance,
        lifetime_earned: allowance > 0 ? allowance : 0,
        lifetime_spent: 0,
        period_start: now.toISOString().split('T')[0],
        period_end: periodEnd.split('T')[0],
      })
      .select()
      .single();

    if (error) throw error;

    // Log initial allowance
    await this.addLedgerEntry(organizationId, {
      event_type: 'monthly_allowance',
      delta: allowance > 0 ? allowance : 0,
      balance_after: allowance > 0 ? allowance : 0,
      description: `Initial monthly allowance for ${planTier} plan`,
    });

    return data;
  },

  // ─── Credit Consumption ────────────────────────────────────────────────────

  /**
   * Deducts credits from the wallet. Returns false if insufficient balance.
   */
  async consumeCredits(
    organizationId: string,
    eventType: CreditEventType,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; balance: number; shortfall?: number }> {
    const cost = CREDIT_COSTS[eventType] ?? 0;
    if (cost === 0) return { success: true, balance: 0 };

    const wallet = await this.getWallet(organizationId);
    if (!wallet) return { success: false, balance: 0, shortfall: cost };

    // Enterprise / unlimited: always succeeds
    if (wallet.monthly_allowance === -1) {
      await this.addLedgerEntry(organizationId, {
        event_type: eventType,
        delta: -cost,
        balance_after: wallet.balance,
        description: CREDIT_LABELS[eventType] ?? eventType,
        user_id: userId,
        metadata,
      });
      return { success: true, balance: wallet.balance };
    }

    if (wallet.balance < cost) {
      return { success: false, balance: wallet.balance, shortfall: cost - wallet.balance };
    }

    const newBalance = wallet.balance - cost;

    const { error } = await supabase
      .from('bb_credit_wallets')
      .update({
        balance: newBalance,
        lifetime_spent: (wallet.lifetime_spent ?? 0) + cost,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId);

    if (error) throw error;

    await this.addLedgerEntry(organizationId, {
      event_type: eventType,
      delta: -cost,
      balance_after: newBalance,
      description: CREDIT_LABELS[eventType] ?? eventType,
      user_id: userId,
      metadata,
    });

    return { success: true, balance: newBalance };
  },

  /**
   * Adds credits to the wallet (top-up, monthly renewal, admin grant).
   */
  async addCredits(
    organizationId: string,
    amount: number,
    eventType: CreditEventType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<CreditWallet> {
    const wallet = await this.getWallet(organizationId);
    if (!wallet) throw new Error('Wallet not found');

    const newBalance = wallet.balance + amount;

    const { data, error } = await supabase
      .from('bb_credit_wallets')
      .update({
        balance: newBalance,
        lifetime_earned: (wallet.lifetime_earned ?? 0) + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .select()
      .single();

    if (error) throw error;

    await this.addLedgerEntry(organizationId, {
      event_type: eventType,
      delta: amount,
      balance_after: newBalance,
      description,
      metadata,
    });

    return data;
  },

  /**
   * Renews monthly allowance at the start of a new billing period.
   * Called from Stripe webhook on invoice.paid.
   */
  async renewMonthlyAllowance(organizationId: string, planTier: string): Promise<void> {
    const allowance = getCreditAllowance(planTier);
    if (allowance <= 0) return;

    const wallet = await this.getWallet(organizationId);

    if (!wallet) {
      await this.ensureWallet(organizationId, planTier);
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Expire unused credits
    const unused = wallet.balance;
    if (unused > 0) {
      await this.addLedgerEntry(organizationId, {
        event_type: 'expiry',
        delta: -unused,
        balance_after: 0,
        description: `Monthly expiry — ${unused} unused credits expired`,
      });
    }

    await supabase
      .from('bb_credit_wallets')
      .update({
        balance: allowance,
        monthly_allowance: allowance,
        lifetime_earned: (wallet.lifetime_earned ?? 0) + allowance,
        period_start: now.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        updated_at: now.toISOString(),
      })
      .eq('organization_id', organizationId);

    await this.addLedgerEntry(organizationId, {
      event_type: 'monthly_allowance',
      delta: allowance,
      balance_after: allowance,
      description: `Monthly allowance renewed — ${allowance} credits`,
    });
  },

  // ─── Ledger ────────────────────────────────────────────────────────────────

  async addLedgerEntry(
    organizationId: string,
    entry: {
      event_type: CreditEventType;
      delta: number;
      balance_after: number;
      description: string;
      user_id?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await supabase.from('bb_credit_ledger').insert({
      organization_id: organizationId,
      ...entry,
    });
  },

  async getLedger(organizationId: string, limit = 20): Promise<CreditLedgerEntry[]> {
    const { data, error } = await supabase
      .from('bb_credit_ledger')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  // ─── Monthly Usage Summary ─────────────────────────────────────────────────

  async getMonthlyUsageSummary(organizationId: string): Promise<{
    byType: Record<string, number>;
    totalConsumed: number;
  }> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('bb_credit_ledger')
      .select('event_type, delta')
      .eq('organization_id', organizationId)
      .gte('created_at', periodStart)
      .lt('delta', 0); // only consumption events

    if (error) throw error;

    const byType: Record<string, number> = {};
    let totalConsumed = 0;

    for (const entry of data ?? []) {
      const type = entry.event_type;
      const abs = Math.abs(entry.delta);
      byType[type] = (byType[type] ?? 0) + abs;
      totalConsumed += abs;
    }

    return { byType, totalConsumed };
  },

  // ─── Admin Controls ────────────────────────────────────────────────────────

  async adminAdjustBalance(
    organizationId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const eventType: CreditEventType = 'admin_adjustment';
    if (amount > 0) {
      await this.addCredits(organizationId, amount, eventType, reason);
    } else {
      const wallet = await this.getWallet(organizationId);
      if (!wallet) throw new Error('Wallet not found');
      const newBalance = Math.max(0, wallet.balance + amount);
      await supabase.from('bb_credit_wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('organization_id', organizationId);
      await this.addLedgerEntry(organizationId, {
        event_type: eventType,
        delta: amount,
        balance_after: newBalance,
        description: reason,
      });
    }
  },
};
