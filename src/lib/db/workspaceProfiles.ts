import { supabase } from '../supabase';
import type { WorkspaceProfile } from '../../types/enhancement';

export const workspaceProfilesService = {
  async getOrCreate(workspaceId: string): Promise<WorkspaceProfile> {
    const { data, error } = await supabase
      .from('bb_workspace_profiles')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data;

    const { data: created, error: createError } = await supabase
      .from('bb_workspace_profiles')
      .insert({
        workspace_id: workspaceId,
        current_software_stack: [],
        must_keep_features: [],
        must_remove_features: [],
        required_integrations: [],
        preferred_ux_style: '',
        workflow_rules: [],
        approval_processes: [],
        enhancement_count: 0,
      })
      .select()
      .single();

    if (createError) throw createError;
    return created;
  },

  async update(
    workspaceId: string,
    updates: Partial<Pick<WorkspaceProfile,
      | 'current_software_stack'
      | 'must_keep_features'
      | 'must_remove_features'
      | 'required_integrations'
      | 'preferred_ux_style'
      | 'workflow_rules'
      | 'approval_processes'
      | 'industry_context'
    >>
  ): Promise<WorkspaceProfile> {
    const { data, error } = await supabase
      .from('bb_workspace_profiles')
      .upsert(
        { workspace_id: workspaceId, ...updates, last_updated_at: new Date().toISOString() },
        { onConflict: 'workspace_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async incrementEnhancementCount(workspaceId: string): Promise<void> {
    const { data } = await supabase
      .from('bb_workspace_profiles')
      .select('enhancement_count')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (data) {
      await supabase
        .from('bb_workspace_profiles')
        .update({ enhancement_count: (data.enhancement_count || 0) + 1 })
        .eq('workspace_id', workspaceId);
    }
  },
};
