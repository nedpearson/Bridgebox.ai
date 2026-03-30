import { supabase } from "../supabase";

export type AuditActionType =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "export"
  | "login";

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string | null;
  action_type: AuditActionType;
  resource_type: string;
  resource_id: string | null;
  delta_json: any | null;
  created_at: string;
  // Included via joins optionally
  user_email?: string;
  user_name?: string;
  org_name?: string;
}

export const auditService = {
  /**
   * Securely logs an action to the immutable ledger via RPC.
   */
  async logEvent(params: {
    organizationId: string;
    actionType: AuditActionType;
    resourceType: string;
    resourceId?: string;
    deltaJson?: any;
  }): Promise<string> {
    const { data, error } = await supabase.rpc("log_audit_event", {
      p_organization_id: params.organizationId,
      p_action_type: params.actionType,
      p_resource_type: params.resourceType,
      p_resource_id: params.resourceId || null,
      p_delta_json: params.deltaJson || null,
    });

    if (error) {
      console.error("Audit Log Injection Failed:", error);
      throw error;
    }

    return data;
  },

  /**
   * Fetches the audit logs for an organization. Validated by PostgreSQL RLS.
   */
  async getOrgLogs(
    organizationId: string,
    limit = 100,
    page = 0,
  ): Promise<{ data: AuditLog[]; count: number }> {
    const from = page * limit;
    const to = from + limit - 1;

    // Use a basic query, joining the auth schema requires a view or edge function usually,
    // but we will simply fetch the raw logs since auth.users isn't heavily exposed without RPC.
    const { data, error, count } = await supabase
      .from("bb_audit_logs")
      .select(
        `
        *,
        users:user_id (
          email,
          raw_user_meta_data
        )
      `,
        { count: "exact" },
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Map the pseudo-join
    const mapped: AuditLog[] = (data || []).map((log: any) => ({
      ...log,
      user_email: log.users?.email,
      user_name: log.users?.raw_user_meta_data?.full_name || "System / Unknown",
    }));

    return { data: mapped, count: count || 0 };
  },

  /**
   * Fetches global audit logs (Super Admin Only). Validated by PostgreSQL RLS.
   */
  async getGlobalLogs(
    limit = 100,
    page = 0,
  ): Promise<{ data: AuditLog[]; count: number }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("bb_audit_logs")
      .select(
        `
        *,
        users:user_id (
          email,
          raw_user_meta_data
        ),
        organizations:organization_id (
          name
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const mapped: AuditLog[] = (data || []).map((log: any) => ({
      ...log,
      user_email: log.users?.email,
      user_name: log.users?.raw_user_meta_data?.full_name || "System / Unknown",
      org_name: log.organizations?.name || "Unknown Org",
    }));

    return { data: mapped, count: count || 0 };
  },
};
