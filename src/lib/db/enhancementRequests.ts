import { supabase } from "../supabase";
import { auditService } from "./audit";
import type {
  EnhancementRequest,
  EnhancementStatus,
  EnhancementRecommendations,
  EnhancementRequestType,
} from "../../types/enhancement";

// Subset type for recent list view
export type RecentEnhancement = {
  id: string;
  title: string;
  status: EnhancementStatus;
  request_type: EnhancementRequestType;
  input_method: string;
  created_at: string;
};

export const enhancementRequestsService = {
  async create(params: {
    workspaceId: string;
    title: string;
    inputMethod: "voice" | "text" | "recording" | "screenshot" | "mixed";
    originalPrompt?: string;
    transcript?: string;
    projectId?: string;
  }): Promise<EnhancementRequest> {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("bb_enhancement_requests")
      .insert({
        workspace_id: params.workspaceId,
        project_id: params.projectId || null,
        created_by: userResult.user.id,
        status: "draft",
        input_method: params.inputMethod,
        title: params.title,
        original_prompt: params.originalPrompt || null,
        transcript: params.transcript || null,
        media_count: 0,
      })
      .select()
      .single();

    if (error) throw error;

    try {
      await auditService.logEvent({
        organizationId: params.workspaceId,
        actionType: "create",
        resourceType: "enhancement_request",
        resourceId: data.id,
        deltaJson: { title: params.title, input_method: params.inputMethod },
      });
    } catch (e) {
      console.warn("Audit log failed but mutation succeeded", e);
    }

    return data;
  },

  async list(workspaceId: string, limit = 50): Promise<EnhancementRequest[]> {
    const { data, error } = await supabase
      .from("bb_enhancement_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async listRecent(
    workspaceId: string,
    limit = 5,
  ): Promise<RecentEnhancement[]> {
    const { data, error } = await supabase
      .from("bb_enhancement_requests")
      .select("id, title, status, request_type, input_method, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<EnhancementRequest | null> {
    const { data, error } = await supabase
      .from("bb_enhancement_requests")
      .select("*, bb_enhancement_media(*), bb_voice_sessions(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async updateStatus(
    id: string,
    status: EnhancementStatus,
    workspaceId: string,
  ): Promise<void> {
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("bb_enhancement_requests")
      .update({
        status,
        updated_by: userResult.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;

    try {
      await auditService.logEvent({
        organizationId: workspaceId,
        actionType: "update",
        resourceType: "enhancement_request",
        resourceId: id,
        deltaJson: { status },
      });
    } catch (e) {
      console.warn("Audit log failed", e);
    }
  },

  async submitForAnalysis(
    id: string,
    workspaceId: string,
    params: {
      analysis_summary: string;
      recommendations_json: EnhancementRecommendations;
      request_type: EnhancementRequestType;
      normalized_prompt?: string;
    },
  ): Promise<void> {
    const { error } = await supabase
      .from("bb_enhancement_requests")
      .update({
        status: "ready_for_review",
        analysis_summary: params.analysis_summary,
        recommendations_json: params.recommendations_json,
        request_type: params.request_type,
        normalized_prompt: params.normalized_prompt || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  async approve(id: string, workspaceId: string): Promise<void> {
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("bb_enhancement_requests")
      .update({
        status: "approved",
        approval_status: "approved",
        updated_by: userResult.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;

    try {
      await auditService.logEvent({
        organizationId: workspaceId,
        actionType: "update",
        resourceType: "enhancement_request",
        resourceId: id,
        deltaJson: { action: "approved" },
      });
    } catch (e) {
      console.warn("Audit log failed", e);
    }
  },

  async reject(
    id: string,
    workspaceId: string,
    reason?: string,
  ): Promise<void> {
    const { data: userResult } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("bb_enhancement_requests")
      .update({
        status: "rejected",
        approval_status: "rejected",
        updated_by: userResult.user?.id,
        conflict_summary: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  async delete(id: string, workspaceId: string): Promise<void> {
    const { error } = await supabase
      .from("bb_enhancement_requests")
      .delete()
      .eq("id", id)
      .eq("workspace_id", workspaceId);

    if (error) throw error;
  },

  async incrementMediaCount(id: string, workspaceId: string): Promise<void> {
    // Manual increment since RPC may not exist yet
    const { data } = await supabase
      .from("bb_enhancement_requests")
      .select("media_count")
      .eq("id", id)
      .eq("workspace_id", workspaceId)
      .single();

    if (data) {
      await supabase
        .from("bb_enhancement_requests")
        .update({ media_count: (data.media_count || 0) + 1 })
        .eq("id", id)
        .eq("workspace_id", workspaceId);
    }
  },
};
