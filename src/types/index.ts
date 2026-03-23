export type UserRole = 'super_admin' | 'team_member' | 'client_admin' | 'client_user';

export type ProjectType = 'custom_software' | 'dashboard' | 'mobile_app' | 'ai_automation' | 'integration' | 'retainer';

export type ProjectStatus = 'lead' | 'proposal' | 'planning' | 'in_progress' | 'testing' | 'deployed' | 'maintenance' | 'completed' | 'on_hold' | 'cancelled';

export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing' | 'paused';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_client' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  organization_id?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  title?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export type LeadStage = 'new' | 'contacted' | 'qualified' | 'discovery' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';

export type LeadSource = 'website' | 'referral' | 'linkedin' | 'cold_outreach' | 'conference' | 'partner' | 'other';

export type BudgetRange = 'under_50k' | '50k_100k' | '100k_250k' | '250k_500k' | '500k_plus' | 'not_disclosed';

export interface Lead {
  id: string;
  company_name?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  contact_title?: string;
  service_interest?: ProjectType[];
  budget_range?: BudgetRange;
  message?: string;
  stage?: LeadStage;
  source?: LeadSource;
  estimated_value?: number;
  expected_close_date?: string;
  assigned_to_id?: string;
  assigned_to?: User;
  last_contact_date?: string;
  next_action?: string;
  next_action_date?: string;
  proposal_id?: string;
  proposal?: Proposal;
  project_id?: string;
  project?: Project;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id: string;
  organization_id: string;
  organization?: Organization;
  primary_contact_id: string;
  primary_contact?: User;
  account_manager_id?: string;
  account_manager?: User;
  status: 'active' | 'inactive' | 'churned';
  onboarded_at: string;
  lifetime_value: number;
  health_score?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  tier: 'starter' | 'professional' | 'enterprise' | 'custom';
  price_monthly: number;
  price_yearly?: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  client?: Client;
  plan_id: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  mrr: number;
  started_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  client?: Client;
  name: string;
  description?: string;
  type: ProjectType;
  status: ProjectStatus;
  start_date?: string;
  target_launch_date?: string;
  actual_launch_date?: string;
  budget?: number;
  contract_value?: number;
  project_manager_id?: string;
  project_manager?: User;
  team_members?: User[];
  progress_percentage: number;
  repository_url?: string;
  staging_url?: string;
  production_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardModule {
  id: string;
  project_id: string;
  project?: Project;
  name: string;
  description?: string;
  module_type: 'analytics' | 'reporting' | 'data_viz' | 'admin' | 'client_portal' | 'custom';
  status: 'planned' | 'in_development' | 'testing' | 'deployed';
  deployed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MobileAppProject {
  id: string;
  project_id: string;
  project?: Project;
  app_name: string;
  platforms: ('ios' | 'android' | 'cross_platform')[];
  framework?: string;
  app_store_url?: string;
  play_store_url?: string;
  version: string;
  build_number?: string;
  last_release_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  id: string;
  client_id: string;
  client?: Client;
  project_id?: string;
  project?: Project;
  name: string;
  provider: string;
  integration_type: 'api' | 'webhook' | 'oauth' | 'database' | 'file_sync' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'pending_setup';
  credentials_configured: boolean;
  last_sync_at?: string;
  sync_frequency?: string;
  error_message?: string;
  config?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  client_id: string;
  client?: Client;
  project_id?: string;
  project?: Project;
  created_by_id: string;
  created_by?: User;
  assigned_to_id?: string;
  assigned_to?: User;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  client?: Client;
  project_id?: string;
  project?: Project;
  subscription_id?: string;
  subscription?: Subscription;
  invoice_number: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string;
  paid_date?: string;
  subtotal: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface TeamMember {
  user_id: string;
  user?: User;
  role_in_project?: string;
  hours_allocated?: number;
  joined_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user?: User;
  entity_type: 'project' | 'client' | 'ticket' | 'invoice' | 'integration' | 'lead' | 'proposal';
  entity_id: string;
  action: string;
  details?: string;
  created_at: string;
}

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface Proposal {
  id: string;
  lead_id: string;
  lead?: Lead;
  client_id?: string;
  client?: Client;
  title: string;
  status: ProposalStatus;
  services: ProposalService[];
  total_min: number;
  total_max: number;
  timeline_weeks?: number;
  valid_until?: string;
  sent_date?: string;
  viewed_date?: string;
  accepted_date?: string;
  declined_date?: string;
  decline_reason?: string;
  notes?: string;
  created_by_id: string;
  created_by?: User;
  created_at: string;
  updated_at: string;
}

export interface ProposalService {
  id: string;
  service_type: ProjectType;
  name: string;
  description?: string;
  deliverables: string[];
  price_min: number;
  price_max: number;
  timeline_weeks?: number;
  is_optional: boolean;
}

export interface PipelineStage {
  stage: LeadStage;
  leads: Lead[];
  total_value: number;
  count: number;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  target_date?: string;
  completion_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  project?: Project;
  name: string;
  description?: string;
  deliverable_type: 'dashboard' | 'mobile_app' | 'documentation' | 'integration' | 'api' | 'design' | 'other';
  status: 'pending' | 'in_progress' | 'review' | 'delivered' | 'approved';
  url?: string;
  file_path?: string;
  delivered_date?: string;
  approved_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ClientPortalAccess {
  client_id: string;
  user_id: string;
  role: 'admin' | 'member';
  last_login?: string;
  created_at: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  industry: string;
  tagline: string;
  client_type: string;
  challenge: string;
  solution: string;
  implementation: string[];
  results: {
    primary: string;
    metrics: CaseStudyMetric[];
  };
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company: string;
  };
  services: ProjectType[];
  thumbnail_color: string;
}

export interface CaseStudyMetric {
  label: string;
  value: string;
  description: string;
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  challenge: string;
  solution: string;
  benefits: string[];
  keyCapabilities: string[];
  caseStudySlugs?: string[];
  iconColor: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
