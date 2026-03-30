export type WorkflowCategory =
  | "lead"
  | "project"
  | "billing"
  | "support"
  | "custom";

export type WorkflowTriggerType =
  | "lead_created"
  | "proposal_approved"
  | "onboarding_completed"
  | "project_created"
  | "support_ticket_created"
  | "invoice_overdue"
  | "manual_trigger"
  | "scheduled_trigger";

export type WorkflowStepType = "action" | "condition" | "delay" | "parallel";

export type WorkflowActionType =
  | "create_project"
  | "assign_team_member"
  | "send_notification"
  | "update_status"
  | "create_task"
  | "flag_risk"
  | "send_email"
  | "create_proposal"
  | "update_field";

export type WorkflowExecutionStatus =
  | "running"
  | "completed"
  | "failed"
  | "paused"
  | "cancelled";
export type WorkflowStepExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "skipped";

export type DelayUnit = "minutes" | "hours" | "days";

export interface Workflow {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  version: number;
  is_active: boolean;
  is_template: boolean;
  trigger_type: WorkflowTriggerType;
  trigger_conditions: Record<string, any>;
  created_by?: string;
  last_modified_by?: string;
  created_at: string;
  updated_at: string;
  execution_count: number;
  last_executed_at?: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_key: string;
  step_name: string;
  step_type: WorkflowStepType;
  action_type?: WorkflowActionType;
  action_config: Record<string, any>;
  condition_expression?: {
    field: string;
    operator: string;
    value: any;
  };
  delay_amount?: number;
  delay_unit?: DelayUnit;
  order_index: number;
  parent_step_id?: string;
  on_true_step_id?: string;
  on_false_step_id?: string;
  next_step_id?: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  organization_id: string;
  trigger_entity_type: string;
  trigger_entity_id: string;
  trigger_data: Record<string, any>;
  status: WorkflowExecutionStatus;
  current_step_id?: string;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  error_message?: string;
  execution_context: Record<string, any>;
  created_at: string;
}

export interface WorkflowStepExecution {
  id: string;
  workflow_execution_id: string;
  step_id: string;
  status: WorkflowStepExecutionStatus;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  output_data?: Record<string, any>;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  icon?: string;
  template_config: WorkflowTemplateConfig;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplateConfig {
  trigger: {
    type: WorkflowTriggerType;
    conditions?: Record<string, any>;
  };
  steps: Array<{
    key: string;
    name: string;
    type: WorkflowStepType;
    config: any;
    connections: {
      next?: string;
      onTrue?: string;
      onFalse?: string;
    };
    position: { x: number; y: number };
  }>;
}

export interface WorkflowWithSteps extends Workflow {
  steps: WorkflowStep[];
}

export interface WorkflowExecutionDetail extends WorkflowExecution {
  workflow: Workflow;
  step_executions: Array<WorkflowStepExecution & { step: WorkflowStep }>;
}

export interface WorkflowStats {
  total: number;
  active: number;
  executions_24h: number;
  success_rate: number;
  by_category: Record<WorkflowCategory, number>;
}
