import { supabase } from "../supabase";
import type { Integration } from "../../types/database";

export const integrationsService = {
  async getOrganizationIntegrations(organizationId: string) {
    const { data, error } = await supabase
      .from("bb_integrations")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Integration[];
  },

  async getProjectIntegrations(projectId: string) {
    const { data, error } = await supabase
      .from("bb_integrations")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Integration[];
  },

  async getIntegrationById(id: string) {
    const { data, error } = await supabase
      .from("bb_integrations")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as Integration | null;
  },

  async createIntegration(
    integration: Omit<Integration, "id" | "created_at" | "updated_at">,
  ) {
    const { data, error } = await supabase
      .from("bb_integrations")
      .insert([integration])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Integration;
  },

  async updateIntegration(id: string, updates: Partial<Integration>) {
    const { data, error } = await supabase
      .from("bb_integrations")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Integration;
  },

  async toggleIntegrationStatus(id: string, isActive: boolean) {
    return this.updateIntegration(id, { is_active: isActive });
  },

  async deleteIntegration(id: string) {
    const { error } = await supabase
      .from("bb_integrations")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async updateLastSync(id: string) {
    return this.updateIntegration(id, {
      last_sync_at: new Date().toISOString(),
    });
  },
};
