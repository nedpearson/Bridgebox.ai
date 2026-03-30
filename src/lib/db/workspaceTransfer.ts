import { supabase } from "../supabase";
import { auditService } from "./audit";
import type {
  TransferBatch,
  TransferItem,
  TransferPreview,
  TransferConflict,
  TransferConflictResolution,
} from "../../types/enhancement";

export const TRANSFERABLE_ASSET_TYPES = [
  "workflow_definition",
  "automation_template",
  "prompt_template",
  "notification_template",
  "form_schema",
  "status_system",
  "settings_bundle",
  "enhancement_recommendation",
] as const;

export type TransferableAssetType = (typeof TRANSFERABLE_ASSET_TYPES)[number];

export const workspaceTransferService = {
  async createBatch(params: {
    sourceWorkspaceId: string;
    targetWorkspaceId: string;
    assetTypes: string[];
  }): Promise<TransferBatch> {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) throw new Error("Not authenticated");

    if (params.sourceWorkspaceId === params.targetWorkspaceId) {
      throw new Error("Source and target workspaces must be different.");
    }

    const { data, error } = await supabase
      .from("bb_workspace_transfer_batches")
      .insert({
        source_workspace_id: params.sourceWorkspaceId,
        target_workspace_id: params.targetWorkspaceId,
        created_by: userResult.user.id,
        status: "draft",
        asset_types: params.assetTypes,
        item_count: 0,
        conflict_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAvailableAssets(
    sourceWorkspaceId: string,
  ): Promise<
    {
      id: string;
      asset_type: string;
      name: string;
      description: string;
      created_at: string;
    }[]
  > {
    const { data, error } = await supabase
      .from("bb_enhancement_requests")
      .select("id, title, request_type, status, created_at")
      .eq("workspace_id", sourceWorkspaceId)
      .in("status", ["approved", "applied", "ready_to_apply"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((item) => ({
      id: item.id,
      asset_type: "enhancement_recommendation",
      name: item.title,
      description: `Enhancement type: ${item.request_type || "unclassified"} — ${item.status}`,
      created_at: item.created_at,
    }));
  },

  async addItem(params: {
    batchId: string;
    assetType: string;
    sourceAssetId: string;
    sourceWorkspaceId: string;
    targetWorkspaceId: string;
    assetName: string;
    assetPayload?: any;
  }): Promise<void> {
    const { error } = await supabase
      .from("bb_workspace_transfer_items")
      .insert({
        batch_id: params.batchId,
        asset_type: params.assetType,
        source_asset_id: params.sourceAssetId,
        source_workspace_id: params.sourceWorkspaceId,
        target_workspace_id: params.targetWorkspaceId,
        asset_name: params.assetName,
        asset_payload: params.assetPayload || null,
        status: "pending",
      });

    if (error) throw error;

    // Bump item count
    const { data: batch } = await supabase
      .from("bb_workspace_transfer_batches")
      .select("item_count")
      .eq("id", params.batchId)
      .single();

    if (batch) {
      await supabase
        .from("bb_workspace_transfer_batches")
        .update({
          item_count: (batch.item_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.batchId);
    }
  },

  async previewBatch(batchId: string): Promise<TransferPreview> {
    const { data: items, error } = await supabase
      .from("bb_workspace_transfer_items")
      .select("*")
      .eq("batch_id", batchId);

    if (error) throw error;

    const conflicts: TransferConflict[] = (items || [])
      .filter((i: TransferItem) => i.status === "conflict")
      .map((i: TransferItem) => ({
        item_id: i.id,
        asset_type: i.asset_type,
        source_name: i.asset_name,
        target_name: i.asset_name,
        conflict_type: "name_collision",
        resolution: i.conflict_resolution || "unresolved",
        rename_to: i.rename_to,
      }));

    const warnings =
      conflicts.length > 0
        ? [
            `${conflicts.length} conflict(s) require resolution before the batch can be applied.`,
          ]
        : [];

    await supabase
      .from("bb_workspace_transfer_batches")
      .update({
        status: "previewed",
        conflict_count: conflicts.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    return {
      items: (items || []).map((i: TransferItem) => ({
        asset_type: i.asset_type,
        source_id: i.source_asset_id,
        name: i.asset_name,
        depends_on: [],
        has_conflict: i.status === "conflict",
      })),
      conflicts,
      dependencies: [],
      warnings,
    };
  },

  async resolveConflict(
    itemId: string,
    resolution: TransferConflictResolution,
    renameTo?: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("bb_workspace_transfer_items")
      .update({
        conflict_resolution: resolution,
        rename_to: renameTo || null,
        status: resolution === "skip" ? "skipped" : "pending",
      })
      .eq("id", itemId);

    if (error) throw error;
  },

  async applyBatch(
    batchId: string,
    targetWorkspaceId: string,
  ): Promise<{ applied: number; failed: number }> {
    const { data: userResult } = await supabase.auth.getUser();
    if (!userResult.user) throw new Error("Not authenticated");

    await supabase
      .from("bb_workspace_transfer_batches")
      .update({ status: "applying", updated_at: new Date().toISOString() })
      .eq("id", batchId)
      .eq("target_workspace_id", targetWorkspaceId);

    const { data: items, error: itemsError } = await supabase
      .from("bb_workspace_transfer_items")
      .select("*")
      .eq("batch_id", batchId)
      .eq("status", "pending");

    if (itemsError) throw itemsError;

    let applied = 0;
    let failed = 0;

    for (const item of items || []) {
      try {
        await supabase
          .from("bb_workspace_transfer_items")
          .update({ status: "applied", imported_at: new Date().toISOString() })
          .eq("id", item.id);

        await supabase.from("bb_workspace_merge_audit_logs").insert({
          batch_id: batchId,
          source_workspace_id: item.source_workspace_id,
          target_workspace_id: item.target_workspace_id,
          asset_type: item.asset_type,
          asset_name: item.rename_to || item.asset_name,
          action: "applied",
          performed_by: userResult.user.id,
        });

        applied++;
      } catch (e) {
        await supabase
          .from("bb_workspace_transfer_items")
          .update({ status: "failed", import_note: String(e) })
          .eq("id", item.id);
        failed++;
      }
    }

    await supabase
      .from("bb_workspace_transfer_batches")
      .update({
        status: failed > 0 && applied === 0 ? "failed" : "applied",
        applied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", batchId);

    try {
      await auditService.logEvent({
        organizationId: targetWorkspaceId,
        actionType: "create",
        resourceType: "workspace_transfer_batch",
        resourceId: batchId,
        deltaJson: { applied, failed },
      });
    } catch (e) {
      console.warn("Audit log failed", e);
    }

    return { applied, failed };
  },

  async listBatches(workspaceId: string): Promise<TransferBatch[]> {
    const { data, error } = await supabase
      .from("bb_workspace_transfer_batches")
      .select("*")
      .or(
        `source_workspace_id.eq.${workspaceId},target_workspace_id.eq.${workspaceId}`,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getClientOrgs(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase
      .from("bb_organizations")
      .select("id, name")
      .order("name");

    if (error) throw error;
    return data || [];
  },
};
