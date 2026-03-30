// ─────────────────────────────────────────────────────────────────────────────
// BRIDGEBOX USAGE EVENTS SERVICE
// Raw metering layer for tracking all billable discovery and platform actions.
// Table: bb_usage_events
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "../supabase";
import type { UsageEvent, UsageMetricType } from "../../types/billing";

export const usageEventsService = {
  // ─── Track Event (fire-and-forget) ────────────────────────────────────────

  async track(
    organizationId: string,
    metricType: UsageMetricType,
    options: {
      userId?: string;
      workspaceId?: string;
      quantity?: number;
      creditCost?: number;
      isOverage?: boolean;
      metadata?: Record<string, any>;
    } = {},
  ): Promise<void> {
    try {
      await supabase.from("bb_usage_events").insert({
        organization_id: organizationId,
        workspace_id: options.workspaceId ?? null,
        user_id: options.userId ?? null,
        metric_type: metricType,
        quantity: options.quantity ?? 1,
        credit_cost: options.creditCost ?? 0,
        is_overage: options.isOverage ?? false,
        metadata: options.metadata ?? {},
      });
    } catch (_e) {
      // Non-fatal: metering failure should never block the user action
      console.warn("[usageEvents] Failed to track event:", metricType, _e);
    }
  },

  // ─── Monthly Breakdown ────────────────────────────────────────────────────

  async getMonthlyBreakdown(
    organizationId: string,
  ): Promise<Record<UsageMetricType, number>> {
    const now = new Date();
    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const { data, error } = await supabase
      .from("bb_usage_events")
      .select("metric_type, quantity")
      .eq("organization_id", organizationId)
      .gte("created_at", periodStart);

    if (error) throw error;

    const breakdown: Partial<Record<UsageMetricType, number>> = {};
    for (const row of data ?? []) {
      const t = row.metric_type as UsageMetricType;
      breakdown[t] = (breakdown[t] ?? 0) + (row.quantity ?? 1);
    }
    return breakdown as Record<UsageMetricType, number>;
  },

  // ─── Daily Timeline ───────────────────────────────────────────────────────

  async getDailyTimeline(
    organizationId: string,
    days = 30,
  ): Promise<
    Array<{
      date: string;
      total: number;
      byType: Partial<Record<UsageMetricType, number>>;
    }>
  > {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data, error } = await supabase
      .from("bb_usage_events")
      .select("metric_type, quantity, created_at")
      .eq("organization_id", organizationId)
      .gte("created_at", from.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    const byDay: Record<
      string,
      { total: number; byType: Partial<Record<UsageMetricType, number>> }
    > = {};

    for (const row of data ?? []) {
      const date = row.created_at.split("T")[0];
      if (!byDay[date]) byDay[date] = { total: 0, byType: {} };
      const t = row.metric_type as UsageMetricType;
      byDay[date].total += row.quantity ?? 1;
      byDay[date].byType[t] =
        (byDay[date].byType[t] ?? 0) + (row.quantity ?? 1);
    }

    return Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));
  },

  // ─── Current Month Count for Limit Checks ───────────────────────────────────

  async getMonthlyCount(
    organizationId: string,
    metricType: UsageMetricType,
  ): Promise<number> {
    const now = new Date();
    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const { data, error } = await supabase
      .from("bb_usage_events")
      .select("quantity")
      .eq("organization_id", organizationId)
      .eq("metric_type", metricType)
      .gte("created_at", periodStart);

    if (error) throw error;
    return (data ?? []).reduce((sum, row) => sum + (row.quantity ?? 1), 0);
  },

  // ─── Admin: Full Event Log ────────────────────────────────────────────────

  async getRecentEvents(
    organizationId: string,
    limit = 50,
  ): Promise<UsageEvent[]> {
    const { data, error } = await supabase
      .from("bb_usage_events")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  },

  // ─── Overage Events ───────────────────────────────────────────────────────

  async getOverageCount(organizationId: string): Promise<number> {
    const now = new Date();
    const periodStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();

    const { count, error } = await supabase
      .from("bb_usage_events")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("is_overage", true)
      .gte("created_at", periodStart);

    if (error) throw error;
    return count ?? 0;
  },
};

// ─── Metric Type Labels ───────────────────────────────────────────────────────

export const USAGE_METRIC_LABELS: Record<string, string> = {
  voice_request: "Voice Discovery Requests",
  recording_upload: "Screen Recordings Uploaded",
  recording_analyzed: "Recordings Analyzed",
  screenshot_analyzed: "Screenshots Analyzed",
  blueprint_generated: "Blueprints Generated",
  refinement_processed: "Refinement Cycles",
  integration_connected: "Integrations Connected",
  workspace_created: "Workspaces Created",
  ai_credit_consumed: "AI Credits Consumed",
  storage_bytes: "Storage Used",
};

export const USAGE_METRIC_ICONS: Record<string, string> = {
  voice_request: "🎤",
  recording_upload: "🎥",
  recording_analyzed: "🔍",
  screenshot_analyzed: "📸",
  blueprint_generated: "🏗️",
  refinement_processed: "🔄",
  integration_connected: "🔗",
  workspace_created: "🗂️",
  ai_credit_consumed: "⚡",
  storage_bytes: "💾",
};
