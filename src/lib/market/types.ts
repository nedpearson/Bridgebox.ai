export type SignalCategory =
  | "industry_demand"
  | "service_demand"
  | "search_trend"
  | "business_activity"
  | "internal_crossover"
  | "opportunity_flag";

export type GrowthDirection =
  | "rising"
  | "stable"
  | "declining"
  | "emerging"
  | "volatile";

export type SignalSource =
  | "search_trends"
  | "industry_reports"
  | "internal_data"
  | "market_research"
  | "competitor_analysis"
  | "customer_feedback"
  | "business_intelligence"
  | "manual_entry";

export type OpportunityStatus =
  | "identified"
  | "investigating"
  | "pursuing"
  | "won"
  | "lost"
  | "archived";

export interface MarketSignal {
  id: string;
  organization_id: string;
  source: SignalSource;
  category: SignalCategory;
  signal_name: string;
  description?: string;
  industry?: string;
  service_type?: string;
  geography?: string;
  confidence_score: number;
  strength_score: number;
  growth_direction: GrowthDirection;
  velocity: number;
  raw_metadata: Record<string, any>;
  data_points: any[];
  signal_date: string;
  created_at: string;
  updated_at: string;
}

export interface MarketSignalScore {
  id: string;
  organization_id: string;
  industry: string;
  service_type?: string;
  geography?: string;
  opportunity_score: number;
  momentum_score: number;
  confidence_level: number;
  growth_direction: GrowthDirection;
  signal_count: number;
  avg_strength: number;
  key_signals: KeySignal[];
  recommendations: Recommendation[];
  score_date: string;
  created_at: string;
  updated_at: string;
}

export interface KeySignal {
  signal_id: string;
  signal_name: string;
  strength: number;
  date: string;
}

export interface Recommendation {
  type: "action" | "insight" | "warning";
  priority: "high" | "medium" | "low";
  message: string;
  context?: string;
}

export interface MarketOpportunity {
  id: string;
  organization_id: string;
  title: string;
  description?: string;
  category: SignalCategory;
  industry: string;
  service_type?: string;
  geography?: string;
  priority_score: number;
  confidence_score: number;
  estimated_value?: number;
  status: OpportunityStatus;
  signal_ids: string[];
  supporting_data: Record<string, any>;
  action_items: ActionItem[];
  identified_at: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
  assigned_to?: string;
  due_date?: string;
}

export interface SignalIngestionInput {
  source: SignalSource;
  category: SignalCategory;
  signal_name: string;
  description?: string;
  industry?: string;
  service_type?: string;
  geography?: string;
  confidence_score?: number;
  strength_score?: number;
  growth_direction?: GrowthDirection;
  velocity?: number;
  raw_metadata?: Record<string, any>;
  data_points?: any[];
  signal_date?: string;
}

export interface SignalScoreInput {
  industry: string;
  service_type?: string;
  geography?: string;
  score_date?: string;
}

export interface OpportunityInput {
  title: string;
  description?: string;
  category: SignalCategory;
  industry: string;
  service_type?: string;
  geography?: string;
  priority_score?: number;
  confidence_score?: number;
  estimated_value?: number;
  signal_ids?: string[];
  supporting_data?: Record<string, any>;
}

export interface EmergingTrend {
  industry: string;
  service_type?: string;
  growth_rate: number;
  signal_count: number;
  confidence: number;
  direction: GrowthDirection;
  key_indicators: string[];
}

export interface MarketInsight {
  type: "opportunity" | "risk" | "trend" | "demand_shift";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  related_signals: string[];
  actionable: boolean;
}
