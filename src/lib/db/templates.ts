import { supabase } from "../supabase";
import { auditService } from "./audit";

export type TemplateStatus = "draft" | "published" | "deprecated";

export interface BridgeboxTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  industry?: string;
  business_model?: string;
  target_personas: any[];
  modules?: any[];
  ai_agents?: any[];
  onboarding_steps?: any[];
  configuration_payload: Record<string, any>;
  billing_rules: Record<string, any>;
  branding_tokens: Record<string, any>;
  is_overlay: boolean;
  merge_strategy: "skip_existing" | "overwrite" | "merge_fields";
  monetization?: {
    is_premium: boolean;
    base_price_impact: number;
    ai_multiplier: number;
    plan_gate: "starter" | "growth" | "pro" | "enterprise";
    setup_fee_estimate: number;
    included_integrations: string[];
  };
  version: string;
  status: TemplateStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateInstall {
  id: string;
  tenant_id: string;
  template_id: string;
  installed_version: string;
  status: "active" | "suspended" | "uninstalled";
  installed_by?: string;
  uninstalled_at?: string;
  analytics_tracking: Record<string, any>;
  generated_assets: Record<string, any>;
  created_at: string;
  updated_at: string;
  template?: BridgeboxTemplate; // Joined locally
}

export const templateService = {
  // === TEMPLATE DEFINITION ENDPOINTS ===

  async getPublishedTemplates(filters?: {
    industry?: string;
    business_model?: string;
  }) {
    let query = supabase
      .from("bb_templates")
      .select("*")
      .eq("status", "published");
    if (filters?.industry) query = query.eq("industry", filters.industry);
    if (filters?.business_model)
      query = query.eq("business_model", filters.business_model);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data as BridgeboxTemplate[];
  },

  async getAllTemplatesForAdmin() {
    const { data, error } = await supabase
      .from("bb_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as BridgeboxTemplate[];
  },

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from("bb_templates")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as BridgeboxTemplate;
  },

  async createTemplate(template: Partial<BridgeboxTemplate>) {
    const { data, error } = await supabase
      .from("bb_templates")
      .insert(template)
      .select()
      .single();
    if (error) throw error;
    return data as BridgeboxTemplate;
  },

  async updateTemplate(id: string, updates: Partial<BridgeboxTemplate>) {
    const { data, error } = await supabase
      .from("bb_templates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as BridgeboxTemplate;
  },

  // === TENANT INSTALLATION ENDPOINTS ===

  async getTenantInstalls(tenantId: string) {
    if (!tenantId) return [];
    const { data, error } = await supabase
      .from("bb_template_installs")
      .select("*, template:bb_templates(*)")
      .eq("tenant_id", tenantId)
      .neq("status", "uninstalled")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as TemplateInstall[]; // Safe cast
  },

  async recordInstallation(
    tenantId: string,
    templateId: string,
    version: string,
    userId: string,
    generatedAssets: Record<string, any> = {},
  ) {
    const { data, error } = await supabase
      .from("bb_template_installs")
      .insert({
        tenant_id: tenantId,
        template_id: templateId,
        installed_version: version,
        installed_by: userId,
        status: "active",
        generated_assets: generatedAssets,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService
      .logEvent({
        organizationId: tenantId,
        actionType: "create",
        resourceType: "template_install",
        resourceId: data.id,
        deltaJson: { templateId, version },
      })
      .catch((e) =>
        console.warn("Audit Trail failed during install record:", e),
      );

    return data as TemplateInstall;
  },

  async softUninstallTemplate(installId: string, tenantId: string) {
    const { data, error } = await supabase
      .from("bb_template_installs")
      .update({
        status: "uninstalled",
        uninstalled_at: new Date().toISOString(),
      })
      .eq("id", installId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
