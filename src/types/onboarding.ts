export interface OnboardingData {
  id?: string;
  organization_id?: string;
  user_id?: string;
  company_name: string;
  company_size: string;
  industry: string;
  website?: string;
  primary_contact_name: string;
  primary_contact_email: string;
  services_needed: string[];
  current_systems: CurrentSystems;
  business_goals: string[];
  timeline: string;
  additional_notes?: string;
  status?: "draft" | "completed" | "reviewed";
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CurrentSystems {
  crm?: string;
  erp?: string;
  accounting?: string;
  spreadsheets?: boolean;
  internal_dashboards?: boolean;
  document_management?: string;
  other?: string[];
}

export const SERVICE_OPTIONS = [
  { value: "custom_software", label: "Custom Software Development" },
  { value: "dashboard_analytics", label: "Dashboards & Analytics" },
  { value: "mobile_app", label: "Mobile Applications" },
  { value: "ai_automation", label: "AI Workflow Automation" },
  { value: "enterprise_integration", label: "Enterprise Integration" },
  { value: "support_retainer", label: "Ongoing Support / Retainer" },
];

export const BUSINESS_GOAL_OPTIONS = [
  "Unify fragmented systems",
  "Reduce manual work",
  "Improve reporting & visibility",
  "Build mobile workflows",
  "Automate operations",
  "Create custom platform",
  "Scale current systems",
  "Improve data accuracy",
];

export const TIMELINE_OPTIONS = [
  { value: "asap", label: "As soon as possible" },
  { value: "30_days", label: "Within 30 days" },
  { value: "60_90_days", label: "60-90 days" },
  { value: "exploratory", label: "Exploratory / No rush" },
];

export const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];
