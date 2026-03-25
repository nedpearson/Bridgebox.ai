import { supabase } from '../supabase';

export type CommunicationChannel = 'email' | 'call' | 'meeting' | 'note' | 'message' | 'activity';
export type CommunicationDirection = 'inbound' | 'outbound' | 'internal';

export interface GlobalCommunication {
  id: string;
  tenant_id?: string;
  channel: CommunicationChannel;
  direction: CommunicationDirection;
  subject?: string;
  content: string;
  author_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const globalCommunicationsService = {
  async logCommunication(comm: Partial<GlobalCommunication>) {
    const { data, error } = await supabase
      .from('global_communications')
      .insert(comm)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getTenantCommunications(tenantId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('global_communications')
      .select('*, author:profiles!global_communications_author_id_fkey(full_name, avatar_url)')
      .eq('tenant_id', tenantId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getCommunicationById(id: string) {
    const { data, error } = await supabase
      .from('global_communications')
      .select('*, author:profiles!global_communications_author_id_fkey(full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as (GlobalCommunication & { author?: any });
  },

  async getLinkedCommunications(entityType: string, entityId: string): Promise<(GlobalCommunication & { author?: any })[]> {
    const { entityLinkService } = await import('./entityLinks');
    const links = await entityLinkService.getLinkedEntities(entityType as any, entityId, 'communication');
    
    const commIds = links.map(link => 
      link.source_type === 'communication' ? link.source_id : link.target_id
    );

    if (commIds.length === 0) return [];

    const { data, error } = await supabase
      .from('global_communications')
      .select('*, author:profiles!global_communications_author_id_fkey(full_name, avatar_url)')
      .in('id', commIds)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
