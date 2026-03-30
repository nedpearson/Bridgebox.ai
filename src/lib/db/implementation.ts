import { supabase } from "../supabase";

export type DeploymentPhase =
  | "setup"
  | "integration"
  | "testing"
  | "staging"
  | "production"
  | "post_launch_support";
export type DeploymentReadiness =
  | "not_ready"
  | "in_progress"
  | "ready"
  | "deployed";
export type LaunchStatus = "pending" | "ready" | "deployed" | "rolled_back";
export type EnvironmentType = "staging" | "production";
export type EnvironmentStatus =
  | "not_configured"
  | "configuring"
  | "active"
  | "error"
  | "maintenance";
export type RiskType =
  | "blocker"
  | "dependency"
  | "technical"
  | "client"
  | "timeline";
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskStatus = "open" | "investigating" | "mitigated" | "resolved";
export type ChecklistCategory =
  | "infrastructure"
  | "integration"
  | "migration"
  | "qa"
  | "approval"
  | "launch";

export interface ProjectImplementation {
  id: string;
  project_id: string;
  deployment_phase: DeploymentPhase;
  deployment_readiness: DeploymentReadiness;
  launch_status: LaunchStatus;
  staging_url?: string;
  production_url?: string;
  last_deployment_at?: string;
  go_live_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImplementationChecklist {
  id: string;
  implementation_id: string;
  category: ChecklistCategory;
  item_title: string;
  item_description?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by_id?: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ImplementationEnvironment {
  id: string;
  implementation_id: string;
  environment_type: EnvironmentType;
  status: EnvironmentStatus;
  url?: string;
  last_health_check?: string;
  configuration_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ImplementationRisk {
  id: string;
  implementation_id: string;
  risk_type: RiskType;
  severity: RiskSeverity;
  title: string;
  description?: string;
  status: RiskStatus;
  assigned_to_id?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ImplementationWithProject extends ProjectImplementation {
  project?: {
    id: string;
    name: string;
    organization_id: string;
    type: string;
    status: string;
    organization?: {
      id: string;
      name: string;
    };
  };
}

export interface ImplementationDetail extends ImplementationWithProject {
  checklists: ImplementationChecklist[];
  environments: ImplementationEnvironment[];
  risks: ImplementationRisk[];
}

class ImplementationService {
  async getAllImplementations(): Promise<ImplementationWithProject[]> {
    const { data, error } = await supabase
      .from("bb_project_implementations")
      .select(
        `
        *,
        project:bb_projects(
          id,
          name,
          organization_id,
          type,
          status,
          organization:bb_organizations(id, name)
        )
      `,
      )
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getImplementationByProjectId(
    projectId: string,
  ): Promise<ImplementationDetail | null> {
    const { data: impl, error: implError } = await supabase
      .from("bb_project_implementations")
      .select(
        `
        *,
        project:bb_projects(
          id,
          name,
          organization_id,
          type,
          status,
          organization:bb_organizations(id, name)
        )
      `,
      )
      .eq("project_id", projectId)
      .maybeSingle();

    if (implError) throw implError;
    if (!impl) return null;

    const [checklistsRes, environmentsRes, risksRes] = await Promise.all([
      supabase
        .from("bb_implementation_checklists")
        .select("*")
        .eq("implementation_id", impl.id)
        .order("category")
        .order("order_index"),
      supabase
        .from("bb_implementation_environments")
        .select("*")
        .eq("implementation_id", impl.id),
      supabase
        .from("bb_implementation_risks")
        .select("*")
        .eq("implementation_id", impl.id)
        .order("severity")
        .order("created_at", { ascending: false }),
    ]);

    if (checklistsRes.error) throw checklistsRes.error;
    if (environmentsRes.error) throw environmentsRes.error;
    if (risksRes.error) throw risksRes.error;

    return {
      ...impl,
      checklists: checklistsRes.data || [],
      environments: environmentsRes.data || [],
      risks: risksRes.data || [],
    };
  }

  async createImplementation(
    projectId: string,
  ): Promise<ProjectImplementation> {
    const { data, error } = await supabase
      .from("bb_project_implementations")
      .insert({ project_id: projectId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateImplementation(
    id: string,
    updates: Partial<ProjectImplementation>,
  ): Promise<ProjectImplementation> {
    const { data, error } = await supabase
      .from("bb_project_implementations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addChecklistItem(
    implementationId: string,
    item: Omit<
      ImplementationChecklist,
      "id" | "implementation_id" | "created_at" | "updated_at"
    >,
  ): Promise<ImplementationChecklist> {
    const { data, error } = await supabase
      .from("bb_implementation_checklists")
      .insert({ implementation_id: implementationId, ...item })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async toggleChecklistItem(id: string, completed: boolean): Promise<void> {
    const { error } = await supabase
      .from("bb_implementation_checklists")
      .update({
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  }

  async updateChecklistItem(
    id: string,
    updates: Partial<ImplementationChecklist>,
  ): Promise<void> {
    const { error } = await supabase
      .from("bb_implementation_checklists")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  }

  async deleteChecklistItem(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_implementation_checklists")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  async upsertEnvironment(
    implementationId: string,
    environmentType: EnvironmentType,
    data: Partial<ImplementationEnvironment>,
  ): Promise<ImplementationEnvironment> {
    const { data: env, error } = await supabase
      .from("bb_implementation_environments")
      .upsert(
        {
          implementation_id: implementationId,
          environment_type: environmentType,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "implementation_id,environment_type" },
      )
      .select()
      .single();

    if (error) throw error;
    return env;
  }

  async createRisk(
    implementationId: string,
    risk: Omit<
      ImplementationRisk,
      "id" | "implementation_id" | "created_at" | "updated_at"
    >,
  ): Promise<ImplementationRisk> {
    const { data, error } = await supabase
      .from("bb_implementation_risks")
      .insert({ implementation_id: implementationId, ...risk })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateRisk(
    id: string,
    updates: Partial<ImplementationRisk>,
  ): Promise<ImplementationRisk> {
    const { data, error } = await supabase
      .from("bb_implementation_risks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteRisk(id: string): Promise<void> {
    const { error } = await supabase
      .from("bb_implementation_risks")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  async initializeDefaultChecklist(implementationId: string): Promise<void> {
    const defaultItems: Array<
      Omit<
        ImplementationChecklist,
        "id" | "implementation_id" | "created_at" | "updated_at"
      >
    > = [
      // Infrastructure
      {
        category: "infrastructure",
        item_title: "Server/Cloud environment provisioned",
        item_description: "Set up hosting infrastructure",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "infrastructure",
        item_title: "Database configured and secured",
        item_description: "Production database setup with backups",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "infrastructure",
        item_title: "CDN and static assets configured",
        item_description: "Configure content delivery",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "infrastructure",
        item_title: "SSL certificates installed",
        item_description: "HTTPS enabled on all domains",
        order_index: 4,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },

      // Integration
      {
        category: "integration",
        item_title: "Third-party APIs integrated",
        item_description: "All external services connected",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "integration",
        item_title: "Authentication system configured",
        item_description: "User auth and SSO if applicable",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "integration",
        item_title: "Payment processing tested (if applicable)",
        item_description: "Billing integrations verified",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "integration",
        item_title: "Email/notification systems active",
        item_description: "Communication channels working",
        order_index: 4,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },

      // Migration
      {
        category: "migration",
        item_title: "Data migration plan finalized",
        item_description: "Data import strategy documented",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "migration",
        item_title: "Test data migration completed",
        item_description: "Dry-run successful",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "migration",
        item_title: "Production data migrated",
        item_description: "Live data successfully imported",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "migration",
        item_title: "Data validation completed",
        item_description: "Verify data integrity",
        order_index: 4,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },

      // QA
      {
        category: "qa",
        item_title: "Unit tests passing",
        item_description: "All automated tests green",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "qa",
        item_title: "Integration tests passing",
        item_description: "End-to-end scenarios verified",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "qa",
        item_title: "Load testing completed",
        item_description: "Performance validated under load",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "qa",
        item_title: "Security audit passed",
        item_description: "Vulnerability scanning completed",
        order_index: 4,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "qa",
        item_title: "UAT completed by client",
        item_description: "User acceptance testing signed off",
        order_index: 5,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },

      // Approval
      {
        category: "approval",
        item_title: "Client sign-off received",
        item_description: "Client approves for production",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "approval",
        item_title: "Legal/compliance review complete",
        item_description: "Terms, privacy, compliance verified",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "approval",
        item_title: "Training materials prepared",
        item_description: "User guides and documentation ready",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },

      // Launch
      {
        category: "launch",
        item_title: "Monitoring and alerts configured",
        item_description: "Error tracking and uptime monitoring",
        order_index: 1,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "launch",
        item_title: "Backup and recovery tested",
        item_description: "Disaster recovery plan verified",
        order_index: 2,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "launch",
        item_title: "DNS records updated",
        item_description: "Domain pointing to production",
        order_index: 3,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "launch",
        item_title: "Production deployment successful",
        item_description: "System live and operational",
        order_index: 4,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "launch",
        item_title: "Client team trained",
        item_description: "Onboarding sessions completed",
        order_index: 5,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
      {
        category: "launch",
        item_title: "Support handoff complete",
        item_description: "Transition to maintenance phase",
        order_index: 6,
        is_completed: false,
        completed_at: null,
        completed_by_id: null,
      },
    ];

    const items = defaultItems.map((item) => ({
      ...item,
      implementation_id: implementationId,
    }));

    const { error } = await supabase
      .from("bb_implementation_checklists")
      .insert(items);
    if (error) throw error;
  }
}

export const implementationService = new ImplementationService();
