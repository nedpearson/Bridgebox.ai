import { supabase } from "../supabase";

export type TriggerType =
  | "lead_created"
  | "proposal_approved"
  | "onboarding_completed"
  | "project_created"
  | "support_ticket_created"
  | "invoice_overdue";

export type ActionType =
  | "create_project"
  | "assign_team_member"
  | "send_notification"
  | "update_status"
  | "create_task"
  | "flag_risk";

export type ExecutionStatus = "pending" | "success" | "failed";

export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  trigger_conditions: Record<string, any>;
  action_type: ActionType;
  action_config: Record<string, any>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationExecution {
  id: string;
  rule_id: string;
  trigger_entity_type: string;
  trigger_entity_id: string;
  status: ExecutionStatus;
  error_message: string | null;
  executed_at: string;
  created_at: string;
}

export interface TriggerConfig {
  type: TriggerType;
  label: string;
  description: string;
  conditions: {
    field: string;
    label: string;
    type: "text" | "select" | "number";
    options?: { value: string; label: string }[];
  }[];
}

export interface ActionConfig {
  type: ActionType;
  label: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: "text" | "select" | "textarea" | "number";
    required?: boolean;
    options?: { value: string; label: string }[];
  }[];
}

export const TRIGGER_CONFIGS: TriggerConfig[] = [
  {
    type: "lead_created",
    label: "New Lead Created",
    description: "Triggered when a new lead is added to the system",
    conditions: [
      {
        field: "lead_type",
        label: "Lead Type",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "custom_software", label: "Custom Software" },
          { value: "automation", label: "Automation" },
          { value: "dashboards", label: "Dashboards" },
          { value: "mobile_app", label: "Mobile App" },
        ],
      },
      {
        field: "budget_min",
        label: "Minimum Budget",
        type: "number",
      },
    ],
  },
  {
    type: "proposal_approved",
    label: "Proposal Approved",
    description: "Triggered when a client approves a proposal",
    conditions: [
      {
        field: "pricing_model",
        label: "Pricing Model",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "fixed_project", label: "Fixed Project" },
          { value: "milestone_based", label: "Milestone Based" },
          { value: "monthly_retainer", label: "Monthly Retainer" },
        ],
      },
    ],
  },
  {
    type: "onboarding_completed",
    label: "Onboarding Completed",
    description: "Triggered when a client completes onboarding",
    conditions: [],
  },
  {
    type: "project_created",
    label: "Project Created",
    description: "Triggered when a new project is created",
    conditions: [
      {
        field: "project_type",
        label: "Project Type",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "dashboard", label: "Dashboard" },
          { value: "mobile_app", label: "Mobile App" },
          { value: "web_app", label: "Web App" },
          { value: "integration", label: "Integration" },
        ],
      },
    ],
  },
  {
    type: "support_ticket_created",
    label: "Support Ticket Created",
    description: "Triggered when a support ticket is created",
    conditions: [
      {
        field: "priority",
        label: "Priority",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "urgent", label: "Urgent" },
          { value: "high", label: "High" },
          { value: "medium", label: "Medium" },
          { value: "low", label: "Low" },
        ],
      },
      {
        field: "category",
        label: "Category",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "bug", label: "Bug" },
          { value: "feature_request", label: "Feature Request" },
          { value: "integration_issue", label: "Integration Issue" },
        ],
      },
    ],
  },
  {
    type: "invoice_overdue",
    label: "Invoice Overdue",
    description: "Triggered when an invoice becomes overdue",
    conditions: [
      {
        field: "days_overdue",
        label: "Days Overdue",
        type: "number",
      },
    ],
  },
];

export const ACTION_CONFIGS: ActionConfig[] = [
  {
    type: "create_project",
    label: "Create Project",
    description: "Automatically create a project from approved proposal",
    fields: [
      {
        key: "project_template",
        label: "Project Template",
        type: "select",
        required: true,
        options: [
          { value: "dashboard", label: "Dashboard Project" },
          { value: "mobile_app", label: "Mobile App Project" },
          { value: "web_app", label: "Web App Project" },
          { value: "integration", label: "Integration Project" },
        ],
      },
      {
        key: "auto_assign_pm",
        label: "Auto-assign Project Manager",
        type: "select",
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ],
      },
    ],
  },
  {
    type: "assign_team_member",
    label: "Assign Team Member",
    description: "Automatically assign a team member",
    fields: [
      {
        key: "assignment_type",
        label: "Assignment Type",
        type: "select",
        required: true,
        options: [
          { value: "round_robin", label: "Round Robin" },
          { value: "least_loaded", label: "Least Loaded" },
          { value: "specific", label: "Specific Person" },
        ],
      },
      {
        key: "role_filter",
        label: "Role Filter",
        type: "select",
        options: [
          { value: "any", label: "Any" },
          { value: "manager", label: "Manager" },
          { value: "developer", label: "Developer" },
          { value: "support", label: "Support" },
        ],
      },
    ],
  },
  {
    type: "send_notification",
    label: "Send Notification",
    description: "Send notification to team members (scaffold)",
    fields: [
      {
        key: "notification_type",
        label: "Notification Type",
        type: "select",
        required: true,
        options: [
          { value: "email", label: "Email" },
          { value: "slack", label: "Slack" },
          { value: "in_app", label: "In-App" },
        ],
      },
      {
        key: "recipients",
        label: "Recipients",
        type: "text",
        required: true,
      },
      {
        key: "message_template",
        label: "Message Template",
        type: "textarea",
      },
    ],
  },
  {
    type: "update_status",
    label: "Update Status",
    description: "Update the status of an entity",
    fields: [
      {
        key: "new_status",
        label: "New Status",
        type: "text",
        required: true,
      },
    ],
  },
  {
    type: "create_task",
    label: "Create Task",
    description: "Create a task in the system (scaffold)",
    fields: [
      {
        key: "task_title",
        label: "Task Title",
        type: "text",
        required: true,
      },
      {
        key: "task_description",
        label: "Task Description",
        type: "textarea",
      },
      {
        key: "assign_to",
        label: "Assign To",
        type: "select",
        options: [
          { value: "account_owner", label: "Account Owner" },
          { value: "project_manager", label: "Project Manager" },
          { value: "team_lead", label: "Team Lead" },
        ],
      },
    ],
  },
  {
    type: "flag_risk",
    label: "Flag Risk",
    description: "Create a risk flag for client success tracking",
    fields: [
      {
        key: "risk_type",
        label: "Risk Type",
        type: "select",
        required: true,
        options: [
          { value: "delayed_onboarding", label: "Delayed Onboarding" },
          { value: "overdue_invoice", label: "Overdue Invoice" },
          { value: "high_support_volume", label: "High Support Volume" },
          { value: "low_engagement", label: "Low Engagement" },
          { value: "churn_risk", label: "Churn Risk" },
        ],
      },
      {
        key: "severity",
        label: "Severity",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
          { value: "critical", label: "Critical" },
        ],
      },
      {
        key: "description",
        label: "Description",
        type: "textarea",
        required: true,
      },
    ],
  },
];

class AutomationService {
  async getAllRules(): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from("bb_automation_rules")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getRuleById(id: string): Promise<AutomationRule | null> {
    const { data, error } = await supabase
      .from("bb_automation_rules")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async createRule(
    rule: Omit<AutomationRule, "id" | "created_at" | "updated_at">,
  ): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from("bb_automation_rules")
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRule(
    id: string,
    updates: Partial<AutomationRule>,
  ): Promise<AutomationRule> {
    const { data, error } = await supabase
      .from("bb_automation_rules")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleRule(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("bb_automation_rules")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async deleteRule(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_automation_rules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  async getExecutions(
    ruleId?: string,
    limit = 50,
  ): Promise<AutomationExecution[]> {
    let query = supabase
      .from("bb_automation_executions")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(limit);

    if (ruleId) {
      query = query.eq("rule_id", ruleId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  async logExecution(
    execution: Omit<AutomationExecution, "id" | "created_at">,
  ): Promise<AutomationExecution> {
    const { data, error } = await supabase
      .from("bb_automation_executions")
      .insert(execution)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActiveRulesByTrigger(
    triggerType: TriggerType,
  ): Promise<AutomationRule[]> {
    const { data, error } = await supabase
      .from("bb_automation_rules")
      .select("*")
      .eq("trigger_type", triggerType)
      .eq("is_active", true);

    if (error) throw error;
    return data || [];
  }

  getTriggerConfig(type: TriggerType): TriggerConfig | undefined {
    return TRIGGER_CONFIGS.find((t) => t.type === type);
  }

  getActionConfig(type: ActionType): ActionConfig | undefined {
    return ACTION_CONFIGS.find((a) => a.type === type);
  }

  async getStats() {
    const [totalRules, activeRules, executions] = await Promise.all([
      supabase
        .from("bb_automation_rules")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("bb_automation_rules")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("bb_automation_executions")
        .select("id, status", { count: "exact", head: false })
        .limit(100),
    ]);

    const recentExecutions = executions.data || [];
    const successCount = recentExecutions.filter(
      (e) => e.status === "success",
    ).length;
    const failedCount = recentExecutions.filter(
      (e) => e.status === "failed",
    ).length;

    return {
      total_rules: totalRules.count || 0,
      active_rules: activeRules.count || 0,
      recent_success: successCount,
      recent_failed: failedCount,
    };
  }
}

export const automationService = new AutomationService();
