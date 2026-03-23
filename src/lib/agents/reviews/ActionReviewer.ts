import { supabase } from '../../supabase';
import type {
  AgentAction,
  ActionReviewDecision,
  ActionFilter,
  ActionStats,
} from '../types';

export class ActionReviewer {
  async getActions(
    organizationId: string,
    filter?: ActionFilter
  ): Promise<{ actions: AgentAction[]; error: Error | null }> {
    try {
      let query = supabase
        .from('agent_actions')
        .select('*')
        .eq('organization_id', organizationId);

      if (filter?.category) {
        query = query.eq('category', filter.category);
      }

      if (filter?.action_type) {
        query = query.eq('action_type', filter.action_type);
      }

      if (filter?.status) {
        query = query.eq('status', filter.status);
      }

      if (filter?.priority) {
        query = query.eq('priority', filter.priority);
      }

      if (filter?.requires_approval !== undefined) {
        query = query.eq('requires_approval', filter.requires_approval);
      }

      if (filter?.min_confidence) {
        query = query.gte('confidence_score', filter.min_confidence);
      }

      if (filter?.entity_type) {
        query = query.eq('context->>entity_type', filter.entity_type);
      }

      if (filter?.entity_id) {
        query = query.eq('context->>entity_id', filter.entity_id);
      }

      if (filter?.created_after) {
        query = query.gte('created_at', filter.created_after);
      }

      query = query.order('suggested_at', { ascending: false });

      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { actions: data || [], error: null };
    } catch (error: any) {
      return { actions: [], error };
    }
  }

  async getPendingReviewActions(
    organizationId: string
  ): Promise<{ actions: AgentAction[]; error: Error | null }> {
    return this.getActions(organizationId, {
      status: 'pending_review',
      requires_approval: true,
    });
  }

  async reviewAction(
    actionId: string,
    userId: string,
    decision: ActionReviewDecision
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    try {
      const updates: any = {
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
        reviewer_notes: decision.notes,
      };

      if (decision.decision === 'approve') {
        updates.status = 'approved';
      } else if (decision.decision === 'dismiss') {
        updates.status = 'dismissed';
      } else if (decision.decision === 'defer') {
        updates.status = 'suggested';
      }

      if (decision.modifications) {
        const { data: currentAction } = await supabase
          .from('agent_actions')
          .select('payload')
          .eq('id', actionId)
          .single();

        if (currentAction) {
          updates.payload = {
            ...currentAction.payload,
            ...decision.modifications,
          };
        }
      }

      const { data, error } = await supabase
        .from('agent_actions')
        .update(updates)
        .eq('id', actionId)
        .select()
        .single();

      if (error) throw error;

      return { action: data, error: null };
    } catch (error: any) {
      return { action: null, error };
    }
  }

  async approveAction(
    actionId: string,
    userId: string,
    notes?: string
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    return this.reviewAction(actionId, userId, {
      action_id: actionId,
      decision: 'approve',
      notes,
    });
  }

  async dismissAction(
    actionId: string,
    userId: string,
    notes?: string
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    return this.reviewAction(actionId, userId, {
      action_id: actionId,
      decision: 'dismiss',
      notes,
    });
  }

  async deferAction(
    actionId: string,
    userId: string,
    notes?: string
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    return this.reviewAction(actionId, userId, {
      action_id: actionId,
      decision: 'defer',
      notes,
    });
  }

  async getActionStats(
    organizationId: string
  ): Promise<{ stats: ActionStats | null; error: Error | null }> {
    try {
      const { data: actions, error } = await supabase
        .from('agent_actions')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;
      if (!actions) return { stats: null, error: null };

      const stats: ActionStats = {
        total_suggested: 0,
        pending_review: 0,
        approved: 0,
        executed: 0,
        dismissed: 0,
        failed: 0,
        avg_confidence: 0,
        by_category: {
          crm: 0,
          proposal: 0,
          project: 0,
          support: 0,
          strategy: 0,
          automation: 0,
        },
        by_priority: {
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      let totalConfidence = 0;

      actions.forEach((action) => {
        stats.total_suggested++;

        if (action.status === 'pending_review') stats.pending_review++;
        if (action.status === 'approved') stats.approved++;
        if (action.status === 'executed') stats.executed++;
        if (action.status === 'dismissed') stats.dismissed++;
        if (action.status === 'failed') stats.failed++;

        stats.by_category[action.category as keyof typeof stats.by_category]++;
        stats.by_priority[action.priority as keyof typeof stats.by_priority]++;

        totalConfidence += action.confidence_score;
      });

      stats.avg_confidence = Math.round(totalConfidence / actions.length);

      return { stats, error: null };
    } catch (error: any) {
      return { stats: null, error };
    }
  }

  async markActionExecuted(
    actionId: string,
    result: any
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('agent_actions')
        .update({
          status: 'executed',
          executed_at: new Date().toISOString(),
          execution_result: result,
        })
        .eq('id', actionId)
        .select()
        .single();

      if (error) throw error;

      return { action: data, error: null };
    } catch (error: any) {
      return { action: null, error };
    }
  }

  async markActionFailed(
    actionId: string,
    errorMessage: string
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('agent_actions')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('id', actionId)
        .select()
        .single();

      if (error) throw error;

      return { action: data, error: null };
    } catch (error: any) {
      return { action: null, error };
    }
  }

  async createAction(
    action: Omit<AgentAction, 'id' | 'created_at' | 'updated_at'>
  ): Promise<{ action: AgentAction | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('agent_actions')
        .insert(action)
        .select()
        .single();

      if (error) throw error;

      return { action: data, error: null };
    } catch (error: any) {
      return { action: null, error };
    }
  }

  async expireOldActions(): Promise<{ count: number; error: Error | null }> {
    try {
      const { error } = await supabase.rpc('expire_old_agent_actions');

      if (error) throw error;

      return { count: 0, error: null };
    } catch (error: any) {
      return { count: 0, error };
    }
  }
}

export const actionReviewer = new ActionReviewer();
