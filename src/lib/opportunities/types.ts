export type OpportunityType = "industry" | "service" | "segment" | "hybrid";

export type OpportunityLevel = "high" | "medium" | "low";

export interface OpportunityScore {
  total_score: number;
  demand_momentum: number;
  revenue_potential: number;
  implementation_fit: number;
  capability_fit: number;
  demand_frequency: number;
  market_signal_confidence: number;
  strategic_alignment: number;
}

export interface OpportunityReason {
  category: "strength" | "risk" | "insight";
  message: string;
  impact: "high" | "medium" | "low";
}

export interface ScoredOpportunity {
  id: string;
  type: OpportunityType;
  name: string;
  description: string;
  industry?: string;
  service_type?: string;
  client_segment?: string;

  score: OpportunityScore;
  overall_score: number;
  confidence_level: number;
  opportunity_level: OpportunityLevel;

  reasons: OpportunityReason[];
  recommended_action: string;

  metrics: {
    current_revenue?: number;
    potential_revenue?: number;
    active_leads?: number;
    active_projects?: number;
    avg_deal_size?: number;
    win_rate?: number;
    market_signals?: number;
    growth_rate?: number;
  };

  calculated_at: string;
}

export interface IndustryOpportunity extends ScoredOpportunity {
  type: "industry";
  industry: string;
  top_services: string[];
  client_count: number;
  total_revenue: number;
}

export interface ServiceOpportunity extends ScoredOpportunity {
  type: "service";
  service_type: string;
  top_industries: string[];
  delivery_count: number;
  avg_project_value: number;
}

export interface OpportunityFilter {
  type?: OpportunityType;
  min_score?: number;
  opportunity_level?: OpportunityLevel;
  industry?: string;
  service_type?: string;
  limit?: number;
}

export interface OpportunityRankingInput {
  includeIndustries?: boolean;
  includeServices?: boolean;
  includeSegments?: boolean;
  timeframe_days?: number;
  min_confidence?: number;
}

export interface OpportunityInsight {
  title: string;
  description: string;
  opportunity_ids: string[];
  priority: "high" | "medium" | "low";
  action_items: string[];
}

export interface HotOpportunitiesSummary {
  top_industries: IndustryOpportunity[];
  top_services: ServiceOpportunity[];
  emerging_combinations: ScoredOpportunity[];
  key_insights: OpportunityInsight[];
  total_potential_revenue: number;
  recommended_focus_areas: string[];
}
