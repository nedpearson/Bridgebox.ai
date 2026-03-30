export type ActionCategory =
  | "crm"
  | "proposal"
  | "project"
  | "support"
  | "strategy"
  | "automation";

export type ActionType =
  | "follow_up_lead"
  | "draft_lead_summary"
  | "draft_outreach"
  | "flag_high_value_lead"
  | "suggest_proposal_creation"
  | "draft_scope_summary"
  | "recommend_pricing_model"
  | "flag_delivery_risk"
  | "suggest_milestone_update"
  | "summarize_blockers"
  | "classify_ticket"
  | "suggest_ticket_response"
  | "escalate_urgent_issue"
  | "recommend_focus_industry"
  | "recommend_service_emphasis"
  | "surface_market_opportunity"
  | "create_automation_rule"
  | "update_client_health";

export type ActionStatus =
  | "suggested"
  | "pending_review"
  | "approved"
  | "executed"
  | "dismissed"
  | "failed";

export type ActionPriority = "high" | "medium" | "low";

export interface ActionContext {
  entity_type:
    | "lead"
    | "project"
    | "proposal"
    | "ticket"
    | "client"
    | "opportunity"
    | "general";
  entity_id?: string;
  entity_name?: string;
  related_data?: Record<string, any>;
  triggering_event?: string;
}

export interface ActionReasoning {
  primary_reason: string;
  supporting_factors: string[];
  data_points: string[];
  potential_impact: string;
}

export interface ActionPayload {
  action_type: ActionType;
  parameters?: Record<string, any>;
  preview_data?: any;
  suggested_values?: Record<string, any>;
}

export interface AgentAction {
  id: string;
  organization_id: string;
  category: ActionCategory;
  action_type: ActionType;
  title: string;
  description: string;

  context: ActionContext;
  reasoning: ActionReasoning;
  payload: ActionPayload;

  confidence_score: number;
  priority: ActionPriority;
  requires_approval: boolean;
  is_destructive: boolean;

  status: ActionStatus;
  suggested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  executed_at?: string;
  execution_result?: any;
  error_message?: string;

  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ActionReviewDecision {
  action_id: string;
  decision: "approve" | "dismiss" | "defer";
  notes?: string;
  modifications?: Record<string, any>;
}

export interface ActionFilter {
  category?: ActionCategory;
  action_type?: ActionType;
  status?: ActionStatus;
  priority?: ActionPriority;
  requires_approval?: boolean;
  min_confidence?: number;
  entity_type?: string;
  entity_id?: string;
  created_after?: string;
  limit?: number;
}

export interface ActionStats {
  total_suggested: number;
  pending_review: number;
  approved: number;
  executed: number;
  dismissed: number;
  failed: number;
  avg_confidence: number;
  by_category: Record<ActionCategory, number>;
  by_priority: Record<ActionPriority, number>;
}

export interface ActionRecommendation {
  action: Omit<AgentAction, "id" | "created_at" | "updated_at">;
  relevance_score: number;
  time_sensitivity: "urgent" | "soon" | "normal";
}

export interface ActionExecutionContext {
  user_id: string;
  organization_id: string;
  action: AgentAction;
  dry_run?: boolean;
}

export interface ActionExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executed_at: string;
  metadata?: Record<string, any>;
}

export interface ActionHandler {
  canHandle(actionType: ActionType): boolean;
  validate(action: AgentAction): Promise<{ valid: boolean; error?: string }>;
  execute(context: ActionExecutionContext): Promise<ActionExecutionResult>;
}
