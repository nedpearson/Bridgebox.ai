export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserRole =
  | "super_admin"
  | "internal_staff"
  | "client_admin"
  | "client_member";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  website?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
  is_enterprise_client?: boolean;
  billing_plan?: string;
  subscription_status?: string;
}

export type OrganizationType = "internal" | "client";

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  lead_id?: string;
  organization_id?: string;
  proposal_number: string;
  title: string;
  description?: string;
  status: ProposalStatus;
  total_amount: number;
  valid_until?: string;
  sent_at?: string;
  accepted_at?: string;
  created_by_id?: string;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired";

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  target_launch_date?: string;
  actual_launch_date?: string;
  budget?: number;
  contract_value?: number;
  progress_percentage: number;
  repository_url?: string;
  staging_url?: string;
  production_url?: string;
  notes?: string;
  project_manager_id?: string;
  created_at: string;
  updated_at: string;
}

export type ProjectType =
  | "dashboard"
  | "mobile_app"
  | "web_app"
  | "integration"
  | "consulting"
  | "other";
export type ProjectStatus =
  | "planning"
  | "in_progress"
  | "testing"
  | "deployed"
  | "on_hold"
  | "completed"
  | "cancelled";

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  target_date?: string;
  completion_date?: string;
  status: MilestoneStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "delayed";

export interface Deliverable {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  deliverable_type: DeliverableType;
  status: DeliverableStatus;
  url?: string;
  file_path?: string;
  delivered_date?: string;
  approved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DeliverableType =
  | "dashboard"
  | "mobile_app"
  | "documentation"
  | "integration"
  | "api"
  | "design"
  | "other";
export type DeliverableStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "delivered"
  | "approved";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: string;
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: "monthly" | "yearly";
  current_period_start: string;
  current_period_end: string;
  mrr: number;
  started_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "paused";

export interface Invoice {
  id: string;
  organization_id: string;
  project_id?: string;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface SupportTicket {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  created_by_id: string;
  assigned_to_id?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_on_client"
  | "resolved"
  | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface Integration {
  id: string;
  organization_id?: string;
  project_id?: string;
  name: string;
  provider: string;
  config: Record<string, unknown>;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  company?: string;
  project_description: string;
  budget_range?: string;
  lead_type: "custom_software" | "automation" | "dashboards" | "mobile_app";
  form_type: "demo" | "custom_build";
  status: "new" | "contacted" | "qualified" | "converted";
  created_at: string;
  updated_at: string;
}
