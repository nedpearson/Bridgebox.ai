import { supabase } from "../supabase";
import type {
  MarketSignal,
  MarketSignalScore,
  MarketOpportunity,
  SignalIngestionInput,
  OpportunityInput,
  SignalScoreInput,
} from "../market/types";

export async function createMarketSignal(
  organizationId: string,
  input: SignalIngestionInput,
): Promise<{ data: MarketSignal | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_signals")
    .insert({
      organization_id: organizationId,
      source: input.source,
      category: input.category,
      signal_name: input.signal_name,
      description: input.description,
      industry: input.industry,
      service_type: input.service_type,
      geography: input.geography,
      confidence_score: input.confidence_score ?? 50,
      strength_score: input.strength_score ?? 50,
      growth_direction: input.growth_direction ?? "stable",
      velocity: input.velocity ?? 0,
      raw_metadata: input.raw_metadata ?? {},
      data_points: input.data_points ?? [],
      signal_date: input.signal_date ?? new Date().toISOString(),
    })
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getMarketSignals(
  organizationId: string,
  filters?: {
    category?: string;
    industry?: string;
    service_type?: string;
    geography?: string;
    startDate?: string;
    endDate?: string;
  },
): Promise<{ data: MarketSignal[] | null; error: Error | null }> {
  let query = supabase
    .from("bb_market_signals")
    .select("*")
    .eq("organization_id", organizationId);

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }
  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }
  if (filters?.service_type) {
    query = query.eq("service_type", filters.service_type);
  }
  if (filters?.geography) {
    query = query.eq("geography", filters.geography);
  }
  if (filters?.startDate) {
    query = query.gte("signal_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("signal_date", filters.endDate);
  }

  query = query.order("signal_date", { ascending: false });

  const { data, error } = await query;
  return { data, error };
}

export async function getSignalById(
  signalId: string,
): Promise<{ data: MarketSignal | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_signals")
    .select("*")
    .eq("id", signalId)
    .maybeSingle();

  return { data, error };
}

export async function updateMarketSignal(
  signalId: string,
  updates: Partial<SignalIngestionInput>,
): Promise<{ data: MarketSignal | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_signals")
    .update(updates)
    .eq("id", signalId)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function deleteMarketSignal(
  signalId: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("bb_market_signals")
    .delete()
    .eq("id", signalId);

  return { error };
}

export async function upsertSignalScore(
  organizationId: string,
  score: Omit<
    MarketSignalScore,
    "id" | "organization_id" | "created_at" | "updated_at"
  >,
): Promise<{ data: MarketSignalScore | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_signal_scores")
    .upsert({
      organization_id: organizationId,
      ...score,
    })
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getSignalScores(
  organizationId: string,
  filters?: {
    industry?: string;
    service_type?: string;
    startDate?: string;
    endDate?: string;
    minOpportunityScore?: number;
  },
): Promise<{ data: MarketSignalScore[] | null; error: Error | null }> {
  let query = supabase
    .from("bb_market_signal_scores")
    .select("*")
    .eq("organization_id", organizationId);

  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }
  if (filters?.service_type) {
    query = query.eq("service_type", filters.service_type);
  }
  if (filters?.startDate) {
    query = query.gte("score_date", filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte("score_date", filters.endDate);
  }
  if (filters?.minOpportunityScore) {
    query = query.gte("opportunity_score", filters.minOpportunityScore);
  }

  query = query.order("opportunity_score", { ascending: false });

  const { data, error } = await query;
  return { data, error };
}

export async function getLatestSignalScores(
  organizationId: string,
  limit: number = 20,
): Promise<{ data: MarketSignalScore[] | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_signal_scores")
    .select("*")
    .eq("organization_id", organizationId)
    .order("score_date", { ascending: false })
    .limit(limit);

  return { data, error };
}

export async function createMarketOpportunity(
  organizationId: string,
  input: OpportunityInput,
): Promise<{ data: MarketOpportunity | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_opportunities")
    .insert({
      organization_id: organizationId,
      title: input.title,
      description: input.description,
      category: input.category,
      industry: input.industry,
      service_type: input.service_type,
      geography: input.geography,
      priority_score: input.priority_score ?? 50,
      confidence_score: input.confidence_score ?? 50,
      estimated_value: input.estimated_value,
      signal_ids: input.signal_ids ?? [],
      supporting_data: input.supporting_data ?? {},
      status: "identified",
      action_items: [],
    })
    .select()
    .maybeSingle();

  return { data, error };
}

export async function getMarketOpportunities(
  organizationId: string,
  filters?: {
    status?: string;
    industry?: string;
    minPriorityScore?: number;
  },
): Promise<{ data: MarketOpportunity[] | null; error: Error | null }> {
  let query = supabase
    .from("bb_market_opportunities")
    .select("*")
    .eq("organization_id", organizationId);

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }
  if (filters?.minPriorityScore) {
    query = query.gte("priority_score", filters.minPriorityScore);
  }

  query = query.order("priority_score", { ascending: false });

  const { data, error } = await query;
  return { data, error };
}

export async function updateOpportunityStatus(
  opportunityId: string,
  status: string,
): Promise<{ data: MarketOpportunity | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("bb_market_opportunities")
    .update({
      status,
      last_reviewed_at: new Date().toISOString(),
    })
    .eq("id", opportunityId)
    .select()
    .maybeSingle();

  return { data, error };
}

export async function addOpportunityActionItem(
  opportunityId: string,
  actionItem: { description: string; assigned_to?: string; due_date?: string },
): Promise<{ data: MarketOpportunity | null; error: Error | null }> {
  const { data: opportunity, error: fetchError } = await supabase
    .from("bb_market_opportunities")
    .select("action_items")
    .eq("id", opportunityId)
    .maybeSingle();

  if (fetchError || !opportunity) {
    return { data: null, error: fetchError };
  }

  const newActionItem = {
    id: crypto.randomUUID(),
    ...actionItem,
    completed: false,
  };

  const updatedItems = [...(opportunity.action_items || []), newActionItem];

  const { data, error } = await supabase
    .from("bb_market_opportunities")
    .update({ action_items: updatedItems })
    .eq("id", opportunityId)
    .select()
    .maybeSingle();

  return { data, error };
}
