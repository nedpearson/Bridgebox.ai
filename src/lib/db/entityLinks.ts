import { supabase } from "../supabase";

export type EntityType =
  | "organization"
  | "project"
  | "task"
  | "workflow"
  | "document"
  | "communication"
  | "onboarding";

export interface EntityLink {
  id: string;
  tenant_id: string;
  source_type: EntityType;
  source_id: string;
  target_type: EntityType;
  target_id: string;
  relationship_type: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const entityLinkService = {
  /**
   * Universal linker: Binds two arbitrary physical modules directly via the DB matrix
   */
  async linkEntities(params: {
    tenant_id: string;
    source_type: EntityType;
    source_id: string;
    target_type: EntityType;
    target_id: string;
    relationship_type: string;
    metadata?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from("bb_entity_links")
      .insert(params)
      .select()
      .single();

    if (error) {
      // Postgres error 23505 = Unique Violation. Means link already established.
      if (error.code === "23505") return null;
      throw error;
    }
    return data as EntityLink;
  },

  /**
   * Unwinds a specific directional bind between two entities
   */
  async unlinkEntities(params: {
    source_type: EntityType;
    source_id: string;
    target_type: EntityType;
    target_id: string;
    relationship_type: string;
  }) {
    const { error } = await supabase.from("bb_entity_links").delete().match({
      source_type: params.source_type,
      source_id: params.source_id,
      target_type: params.target_type,
      target_id: params.target_id,
      relationship_type: params.relationship_type,
    });

    if (error) throw error;
    return true;
  },

  /**
   * Unified fetch resolving all inbound and outbound relations for a target entity node
   */
  async getLinkedEntities(
    source_type: EntityType,
    source_id: string,
    target_type?: EntityType,
    relationship_type?: string,
  ) {
    let query = supabase
      .from("bb_entity_links")
      .select("*")
      .or(
        `and(source_type.eq.${source_type},source_id.eq.${source_id}),and(target_type.eq.${source_type},target_id.eq.${source_id})`,
      );

    // Narrow down by specific opposing node type if requested
    if (target_type) {
      query = query.or(
        `and(target_type.eq.${target_type}),and(source_type.eq.${target_type})`,
      );
    }

    if (relationship_type) {
      query = query.eq("relationship_type", relationship_type);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;
    return data as EntityLink[];
  },

  /**
   * Ultra-fast database-level counter aggregation for Command Centers
   */
  async getEntityLinkCounts(
    entityType: EntityType,
    entityId: string,
  ): Promise<Record<string, number>> {
    const { data, error } = await supabase.rpc("get_entity_link_counts", {
      p_entity_type: entityType,
      p_entity_id: entityId,
    });

    if (error) {
      console.error("RPC get_entity_link_counts failed:", error);
      return {};
    }

    // Convert array [{linked_type: 'task', link_count: 5}] into { task: 5 }
    return (data as any[]).reduce(
      (acc, row) => {
        acc[row.linked_type] = Number(row.link_count);
        return acc;
      },
      {} as Record<string, number>,
    );
  },
};
