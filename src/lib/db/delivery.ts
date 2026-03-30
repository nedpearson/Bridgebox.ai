import { supabase } from "../supabase";

export type DeliveryPhase =
  | "discovery"
  | "planning"
  | "design"
  | "build"
  | "integration"
  | "qa"
  | "deployment"
  | "support";
export type HealthStatus = "green" | "yellow" | "red";
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";
export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "at_risk"
  | "completed"
  | "blocked";
export type DeliverableType =
  | "documentation"
  | "design"
  | "code"
  | "dashboard"
  | "mobile_app"
  | "integration"
  | "deployment"
  | "training";
export type DeliverableStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "approved"
  | "delivered";
export type NoteType =
  | "update"
  | "risk"
  | "blocker"
  | "decision"
  | "client_feedback";

export interface ProjectDelivery {
  id: string;
  project_id: string;
  delivery_phase: DeliveryPhase;
  health_status: HealthStatus;
  current_milestone?: string;
  completion_percentage: number;
  risk_level: RiskLevel;
  team_lead_id?: string;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectDeliveryWithDetails extends ProjectDelivery {
  project?: any;
  team_lead?: { full_name?: string; email: string };
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: MilestoneStatus;
  owner_id?: string;
  completion_date?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneWithDetails extends Milestone {
  owner?: { full_name?: string; email: string };
}

export interface Deliverable {
  id: string;
  project_id: string;
  milestone_id?: string;
  type: DeliverableType;
  title: string;
  description?: string;
  status: DeliverableStatus;
  file_references: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNote {
  id: string;
  project_id: string;
  author_id?: string;
  note_type: NoteType;
  content: string;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliveryNoteWithAuthor extends DeliveryNote {
  author?: { full_name?: string; email: string };
}

export const deliveryService = {
  async getAllActiveDeliveries(filters?: {
    phase?: DeliveryPhase;
    health?: HealthStatus;
    risk?: RiskLevel;
  }) {
    let query = supabase
      .from("bb_project_delivery")
      .select(
        `
        *,
        project:bb_projects!project_delivery_project_id_fkey(id, name, service_type, organization_id, bb_organizations(name)),
        team_lead:bb_profiles!project_delivery_team_lead_id_fkey(full_name, email)
      `,
      )
      .order("health_status", { ascending: false });

    if (filters?.phase) {
      query = query.eq("delivery_phase", filters.phase);
    }

    if (filters?.health) {
      query = query.eq("health_status", filters.health);
    }

    if (filters?.risk) {
      query = query.eq("risk_level", filters.risk);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as ProjectDeliveryWithDetails[];
  },

  async getProjectDelivery(projectId: string) {
    const { data, error } = await supabase
      .from("bb_project_delivery")
      .select(
        `
        *,
        project:bb_projects!project_delivery_project_id_fkey(*, bb_organizations(name)),
        team_lead:bb_profiles!project_delivery_team_lead_id_fkey(full_name, email)
      `,
      )
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) throw error;
    return data as ProjectDeliveryWithDetails | null;
  },

  async createProjectDelivery(data: Partial<ProjectDelivery>) {
    const { data: delivery, error } = await supabase
      .from("bb_project_delivery")
      .insert([data])
      .select()
      .maybeSingle();

    if (error) throw error;
    return delivery as ProjectDelivery;
  },

  async updateProjectDelivery(
    projectId: string,
    updates: Partial<ProjectDelivery>,
  ) {
    const { data, error } = await supabase
      .from("bb_project_delivery")
      .update(updates)
      .eq("project_id", projectId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as ProjectDelivery;
  },

  async getProjectMilestones(projectId: string) {
    const { data, error } = await supabase
      .from("bb_milestones")
      .select(
        `
        *,
        owner:bb_profiles!milestones_owner_id_fkey(full_name, email)
      `,
      )
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    return data as MilestoneWithDetails[];
  },

  async createMilestone(milestone: Partial<Milestone>) {
    const { data, error } = await supabase
      .from("bb_milestones")
      .insert([milestone])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Milestone;
  },

  async updateMilestone(id: string, updates: Partial<Milestone>) {
    const { data, error } = await supabase
      .from("bb_milestones")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Milestone;
  },

  async deleteMilestone(id: string) {
    const { error } = await supabase
      .from("bb_milestones")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getProjectDeliverables(projectId: string) {
    const { data, error } = await supabase
      .from("bb_deliverables")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Deliverable[];
  },

  async getMilestoneDeliverables(milestoneId: string) {
    const { data, error } = await supabase
      .from("bb_deliverables")
      .select("*")
      .eq("milestone_id", milestoneId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Deliverable[];
  },

  async createDeliverable(deliverable: Partial<Deliverable>) {
    const { data, error } = await supabase
      .from("bb_deliverables")
      .insert([deliverable])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Deliverable;
  },

  async updateDeliverable(id: string, updates: Partial<Deliverable>) {
    const { data, error } = await supabase
      .from("bb_deliverables")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Deliverable;
  },

  async deleteDeliverable(id: string) {
    const { error } = await supabase
      .from("bb_deliverables")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getProjectNotes(projectId: string) {
    const { data, error } = await supabase
      .from("bb_delivery_notes")
      .select(
        `
        *,
        author:bb_profiles!delivery_notes_author_id_fkey(full_name, email)
      `,
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as DeliveryNoteWithAuthor[];
  },

  async createNote(note: Partial<DeliveryNote>) {
    const { data: user } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("bb_delivery_notes")
      .insert([{ ...note, author_id: user?.user?.id }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as DeliveryNote;
  },

  async deleteNote(id: string) {
    const { error } = await supabase
      .from("bb_delivery_notes")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async getDeliveryStats() {
    const { data, error } = await supabase
      .from("bb_project_delivery")
      .select("delivery_phase, health_status, risk_level");

    if (error) throw error;

    const stats = {
      total: data.length,
      by_phase: {
        discovery: data.filter((d) => d.delivery_phase === "discovery").length,
        planning: data.filter((d) => d.delivery_phase === "planning").length,
        design: data.filter((d) => d.delivery_phase === "design").length,
        build: data.filter((d) => d.delivery_phase === "build").length,
        integration: data.filter((d) => d.delivery_phase === "integration")
          .length,
        qa: data.filter((d) => d.delivery_phase === "qa").length,
        deployment: data.filter((d) => d.delivery_phase === "deployment")
          .length,
        support: data.filter((d) => d.delivery_phase === "support").length,
      },
      by_health: {
        green: data.filter((d) => d.health_status === "green").length,
        yellow: data.filter((d) => d.health_status === "yellow").length,
        red: data.filter((d) => d.health_status === "red").length,
      },
      high_risk: data.filter((d) => ["high", "critical"].includes(d.risk_level))
        .length,
    };

    return stats;
  },
};
